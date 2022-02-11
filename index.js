const { DOMParser } = require('@xmldom/xmldom');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { namespaces, customXPathFunctions, extract } = require('./src/xpathContextOptions');
const { shortRoleToFullRole, isNonEmptyString, handleError } = require('./src/utils');

const coConfigPath = process.env.CO_CONF ? process.env.CO_CONF : 'co-config';
const metadataXpaths = require(path.join(coConfigPath, 'metadata-xpaths.json'));
const mappingTD = require(path.join(coConfigPath, 'metadata-mappings.json'));
const sourceIdsMap = _.transform(mappingTD, (sourceIds, { source, nameID }) => {
  sourceIds[source] = nameID;
}, {});

/**
 * Entry point of the module.
 * @param {object} docObject The docObject coming from the previous module.
 * @param {function} callback The callback.
 */
function doTheJob (docObject, callback) {
  if (!docObject.metadata) {
    return callback(handleError(docObject, 'NoMetadataError', new Error('No metadata key found in docObject')));
  }

  const teiObj = _.find(docObject.metadata, { mime: 'application/tei+xml', original: false });
  if (!teiObj || !teiObj.path) {
    return callback(handleError(docObject, 'NoTeiError', new Error('No TEI found in the docObject.metadata')));
  }

  fs.readFile(teiObj.path, 'utf8', (err, xml) => {
    if (err) {
      const errName = err.code === 'ENOENT' ? 'FileNotFoundError' : null;
      return callback(handleError(docObject, errName, err));
    }

    let xmlParsingError;
    const xmlParsingOptions = {
      errorHandler (level, errMsg) {
        xmlParsingError = new Error(errMsg);
      },
    };
    const doc = new DOMParser(xmlParsingOptions).parseFromString(xml, 'text/xml');
    if (xmlParsingError) {
      return callback(handleError(docObject, 'XmlParsingError', xmlParsingError));
    }

    doc.documentElement.setAttribute('source', docObject.source);

    let duplicateGenre;
    const extractMetadata = {};
    let flagSource = false;
    const evaluatorOptions = {
      node: doc,
      namespaces,
      functions: customXPathFunctions,
    };

    try {
      metadataXpaths.forEach(metadata => {
        extractMetadata[metadata.name] = extract(metadata, evaluatorOptions);
      });
    } catch (err) {
      return callback(handleError(docObject, 'XmlPathExtractionError', err));
    }

    for (const mapping of mappingTD) {
      if (mapping.source.trim() === docObject.source.toLowerCase().trim()) {
        const { originalGenre } = extractMetadata;
        if (mapping.mapping[originalGenre]) duplicateGenre = mapping.mapping[originalGenre];

        // Flag set to true when the source id is present
        if (isNonEmptyString(extractMetadata[mapping.nameID])) flagSource = true;

        break;
      }
    }

    // Check if the docObject has a source id
    if (flagSource === false) {
      return callback(handleError(docObject, 'NoSourceIdError', new Error('No source id found')));
    }

    // If the Conditor type is "Conférence" or "Autre" and an ISSN or EISSN
    // are present then set the Conditor type to "Article"
    if ((duplicateGenre === 'Conférence' || duplicateGenre === 'Conférence') && (isNonEmptyString(extractMetadata.issn) || isNonEmptyString(extractMetadata.eissn))) {
      duplicateGenre = 'Article';
    }

    // If the Conditor type is "Thèse" and an ISBN is present then set the Conditor type to "Ouvrage"
    if (duplicateGenre === 'Thèse' && isNonEmptyString(extractMetadata.isbn)) {
      duplicateGenre = 'Ouvrage';
    }

    // If the Conditor type is "Conférence" and an ISBN is present then set the Conditor type to "Chapitre"
    if (duplicateGenre === 'Conférence' && isNonEmptyString(extractMetadata.isbn)) {
      duplicateGenre = 'Chapitre';
    }

    // Check if the Conditor type is set
    if (!duplicateGenre) {
      return callback(handleError(docObject, 'NoConditorTypeError', new Error('No Conditor type found')));
    }

    // Convert the roles to their full form
    extractMetadata.host.editor.forEach(editor => {
      editor.roles = shortRoleToFullRole(editor.roles);
    });

    // TODO: Try to find a better solution than entirely copying the entity model into the docObject
    Object.assign(docObject, extractMetadata);

    _.set(docObject, '_business.duplicateGenre', duplicateGenre);

    const nameID = sourceIdsMap[docObject.source];
    docObject.sourceId = docObject[nameID];
    docObject.sourceUid = `${docObject.source}$${docObject[nameID]}`;

    return callback();
  });
}

module.exports = {
  doTheJob,
};
