const { DOMParser } = require('@xmldom/xmldom');
const fs = require('fs');
const xpath = require('xpath');
const _ = require('lodash');

const coConfigPath = process.env.CO_CONF ? process.env.CO_CONF : 'co-config';
const metadataXpaths = require(`${coConfigPath}/metadata-xpaths.json`);
const mappingTD = require(`${coConfigPath}/metadata-mappings.json`);
const sourceIdsMap = _.transform(mappingTD, (sourceIds, { source, nameID }) => {
  sourceIds[source] = nameID;
}, {});

const namespaces = {
  TEI: 'http://www.tei-c.org/ns/1.0',
  'xmlns:hal': 'http://hal.archives-ouvertes.fr/',
  str: 'http://exslt.org/strings',
};

const evalFunctions = {
  'lower-case': context => {
    return context
      .contextNode
      .getAttribute('type')
      .toLowerCase();
  },
  'process-title': (context, values) => {
    const { nodes } = values;

    if (!isNonEmptyArray(nodes)) return '';

    let result;
    let mainTitleNode = '';

    // Looking for main title
    for (const titleNode of nodes) {
      if (!titleNode.hasAttribute('type') || titleNode.getAttribute('type') !== 'sub') {
        mainTitleNode = titleNode;
        result = titleNode.textContent;
        break;
      }
    }

    // Looking for subtitles with the same language as the main title (only for sudoc)
    const sourceName = context.contextNode.documentElement.getAttribute('source');
    if (sourceName === 'sudoc-theses' || sourceName === 'sudoc-ouvrages') {
      nodes.forEach(titleNode => {
        const isSubtitleOfSameLanguage = titleNode.hasAttribute('type') &&
          titleNode.getAttribute('type') === 'sub' &&
          mainTitleNode.getAttribute('xml:lang') === titleNode.getAttribute('xml:lang');

        if (isSubtitleOfSameLanguage) result += ` : ${titleNode.textContent}`;
      });
    }

    return result;
  },
  'first-of-split': (context, text, separator) => {
    const sanitizedSplit = _.compact(_.split(text, separator));

    return (isNonEmptyArray(sanitizedSplit)) ? sanitizedSplit[0] : '';
  },
  'deduplicate-by-text': (context, values) => {
    const uniqueValues = [];
    const dedupNodes = [];

    values.nodes.forEach(node => {
      if (!uniqueValues.includes(node.textContent)) {
        uniqueValues.push(node.textContent);
        dedupNodes.push(node);
      }
    });

    if (!_.isEmpty(uniqueValues)) values.nodes = dedupNodes;

    return values;
  },
};

const business = {
  namespaces,
  evalFunctions,
};

business.doTheJob = (docObject, callback) => {
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

    let typeConditor;
    const extractMetadata = {};
    let flagSource = false;
    const evaluatorOptions = {
      node: doc,
      namespaces,
      functions: evalFunctions,
    };

    try {
      metadataXpaths.forEach(metadata => {
        extractMetadata[metadata.name] = business.extract(metadata, evaluatorOptions);
      });
    } catch (err) {
      return callback(handleError(docObject, 'XmlPathExtractionError', err));
    }

    for (const mapping of mappingTD) {
      if (mapping.source.trim() === docObject.source.toLowerCase().trim()) {
        const { documentType } = extractMetadata;
        if (isNonEmptyArray(documentType) && mapping.mapping[documentType[0]]) typeConditor = mapping.mapping[documentType[0]];

        // Flag set to true when the source id is present
        if (extractMetadata[mapping.nameID].trim() !== '') flagSource = true;

        break;
      }
    }

    // Check if the docObject has a source id
    if (flagSource === false) {
      return callback(handleError(docObject, 'NoSourceIdError', new Error('No source id found')));
    }

    // If the Conditor type is "Conférence" or "Autre" and an ISSN or EISSN
    // are present then set the Conditor type to "Article"
    if ((typeConditor === 'Conférence' || typeConditor === 'Conférence') && (isNonEmptyString(extractMetadata.issn) || isNonEmptyString(extractMetadata.eissn))) {
      typeConditor = 'Article';
    }

    // If the Conditor type is "Thèse" and an ISBN is present then set the Conditor type to "Ouvrage"
    if (typeConditor === 'Thèse' && isNonEmptyString(extractMetadata.isbn)) {
      typeConditor = 'Ouvrage';
    }

    // If the Conditor type is "Conférence" and an ISBN is present then set the Conditor type to "Chapitre"
    if (typeConditor === 'Conférence' && isNonEmptyString(extractMetadata.isbn)) {
      typeConditor = 'Chapitre';
    }

    // Check if the Conditor type is set
    if (!typeConditor) {
      return callback(handleError(docObject, 'NoConditorTypeError', new Error('No Conditor type found')));
    }

    // TODO: Try to find a better solution than entirely copying the entity model into the docObject
    Object.assign(docObject, extractMetadata);

    docObject.typeConditor = typeConditor;

    const nameID = sourceIdsMap[docObject.source];
    docObject.sourceId = docObject[nameID];
    docObject.sourceUid = `${docObject.source}$${docObject[nameID]}`;

    return callback();
  });
};

business.matchRegExp = (metadataRegexp, value) => {
  if (metadataRegexp.regexp && metadataRegexp.regexp !== '') {
    const regexp = new RegExp(metadataRegexp.regexp, metadataRegexp.flag);

    return value.replace(regexp, metadataRegexp.replace);
  }
};

business.extract = (metadata, contextOptions) => {
  let select;

  if (metadata.type === 'simpleString' && metadata.path) {
    select = xpath.parse(metadata.path).evaluateString(contextOptions);
    if (metadata.regexp) select = business.matchRegExp(metadata, select);

    if (metadata.attributeName && metadata.attributeName.trim() !== '') {
      const obj = {};
      obj[metadata.attributeName] = select;
      select = obj;
    }

    if (select === '' && metadata.allowEmpty === false) return undefined;

    return select;
  } else if (metadata.type === 'boolean' && metadata.path) {
    select = xpath.parse(metadata.path).evaluateBoolean(contextOptions);
    if (metadata.attributeName && metadata.attributeName.trim() !== '') {
      const obj = {};
      obj[metadata.attributeName] = select;
      select = obj;
    }

    return select;
  } else if (metadata.type === 'array' && metadata.fields) {
    let limited = false;
    let limit = 0;

    if (metadata.limit) {
      limited = true;
      limit = metadata.limit;
    }

    let result = _.values(_.mapValues(metadata.fields, (field, key) => {
      if (!limited || limit > 0) {
        limit--;
        return business.extract(field, contextOptions);
      }
    }));

    if (metadata.concat === true && metadata.separator) {
      let string = '';
      _.each(result, (field) => {
        if (string.trim() === '') { string += field; } else { string += metadata.separator + field; }
      });
      result = string;
    }

    if (metadata.attributeName && metadata.attributeName.trim() !== '') {
      const obj = {};
      obj[metadata.attributeName] = result;
      result = obj;
    }

    return result;
  } else if (metadata.type === 'struct' && metadata.fields) {
    const obj = {};
    _.each(metadata.fields, (field) => {
      obj[field.name] = business.extract(field, contextOptions);
    });

    return obj;
  } else if (metadata.type === 'bloc' && metadata.path && metadata.fields) {
    let result = [];
    let limited = false;
    let limit = 0;

    if (metadata.limit) {
      limited = true;
      limit = metadata.limit;
    }

    select = xpath.parse(metadata.path).select(contextOptions);
    _.each(select, (iteSelect) => {
      if (!limited || limit > 0) {
        const docBloc = new DOMParser().parseFromString(iteSelect.toString(), 'text/xml');
        const evaluatorOptionsBloc = {
          node: docBloc,
          namespaces: namespaces,
          functions: evalFunctions,
        };
        const extractChild = business.extract(metadata.fields, evaluatorOptionsBloc);

        if (extractChild) result.push(extractChild);
        limit--;
      }
    });
    if (metadata.concat === true && metadata.separator) {
      let string = '';
      _.each(result, (field) => {
        if (string.trim() === '') { string += field; } else { string += metadata.separator + field; }
      });
      result = string;
    }
    if (metadata.attributeName && metadata.attributeName.trim() !== '') {
      const obj = {};
      obj[metadata.attributeName] = result;
      result = obj;
    }

    return result;
  } else if (metadata.type === 'object' && metadata.name && metadata.fields) {
    const result = {};
    _.each(metadata.fields, (field) => {
      if (field.name && field.name !== '') {
        result[field.name] = business.extract(field, contextOptions);
      }
    });

    return result;
  }
};

/**
 * Returns `true` if `value` is an array containing at least one element, `false` otherwise.
 * @param {any} value The value to check.
 * @returns `true` if `value` is an array containing at least one element, `false` otherwise.
 */
function isNonEmptyArray (value) {
  return _.isArray(value) && !_.isEmpty(value);
}

/**
 * Returns `true` if `value` is a string containing at least one character, `false` otherwise.
 * @param {any} value The value to check.
 * @returns `true` if `value` is a string containing at least one character, `false` otherwise.
 */
function isNonEmptyString (value) {
  return _.isString(value) && !_.isEmpty(value);
}

/**
 * Uses the information from `originalErr` to populate `docObject` then modifies `originalErr` before returning it.
 * @param {object} docObject The docObject.
 * @param {string} errName The name of the error.
 * @param {Error} originalErr The `Error` instance that will be modified then returned.
 * @returns The modified `Error` instance.
 */
function handleError (docObject, errName, originalErr) {
  if (!errName) errName = 'Error';

  docObject.errCode = errName;
  docObject.errMsg = originalErr.message;

  originalErr.name = errName;

  return originalErr;
}

module.exports = business;
