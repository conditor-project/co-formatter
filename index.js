const Dom = require('@xmldom/xmldom').DOMParser;
const fs = require('fs');
const xpath = require('xpath');
const _ = require('lodash');
const metadataXpaths = require('co-config/metadata-xpaths.json');
const mappingTD = require('co-config/metadata-mappings.json');
const sourceIdsMap = _.transform(mappingTD, (sourceIds, { source, nameID }) => {
  sourceIds[source] = nameID;
}, {});

const namespaces = {
  TEI: 'http://www.tei-c.org/ns/1.0',
  'xmlns:hal': 'http://hal.archives-ouvertes.fr/',
  str: 'http://exslt.org/strings',
};

const evalFunctions = {
  'lower-case': (context, arg) => {
    return context
      .contextNode
      .getAttribute('type')
      .toLowerCase();
  },
  'process-title': (context, values) => {
    if (!values.nodes || values.nodes.length === 0) return '';

    let result;
    let mainTitleNode = '';

    // Looking for main title
    for (const nodeTitle of values.nodes) {
      if (!nodeTitle.hasAttribute('type') || nodeTitle.getAttribute('type') !== 'sub') {
        mainTitleNode = nodeTitle;
        result = nodeTitle.textContent;
        break;
      }
    }

    // Looking for subtitle with the same language as the main title (only for sudoc)
    const sourceName = context.contextNode.documentElement.getAttribute('source');
    if (sourceName === 'sudoc-theses' || sourceName === 'sudoc-ouvrages') {
      for (const nodeTitle of values.nodes) {
        if (nodeTitle.hasAttribute('type') && nodeTitle.getAttribute('type') === 'sub') {
          if (mainTitleNode.getAttribute('xml:lang') === nodeTitle.getAttribute('xml:lang')) {
            result += ` : ${nodeTitle.textContent}`;
          }
        }
      }
    }

    return result;
  },
  'first-of-split': (context, text, separator) => {
    const elems = _.split(text, separator);
    const compacted = _.compact(elems);

    return (Array.isArray(compacted) && compacted.length > 0) ? compacted[0] : '';
  },
  'deduplicate-by-text': (context, values) => {
    const uniqueValues = [];
    const dedupNodes = [];

    for (const node of values.nodes) {
      if (!uniqueValues.includes(node.textContent)) {
        uniqueValues.push(node.textContent);
        dedupNodes.push(node);
      }
    }

    if (uniqueValues.length > 0) values.nodes = dedupNodes;

    return values;
  },
};

const business = {
  namespaces,
  evalFunctions,
};

business.doTheJob = (docObject, cb) => {
  let error;

  if (!docObject.metadata) {
    error = {
      errCode: 5,
      errMessage: 'No metadata key found in docObject',
    };
    docObject.push(error);

    return cb(error);
  }

  const teiObj = _.find(docObject.metadata, { mime: 'application/tei+xml', original: false });

  if (!teiObj || !teiObj.path) {
    error = {
      errCode: 5,
      errMessage: 'No TEI found in the docObject.metadata',
    };
    docObject.push(error);

    return cb(error);
  }

  const xml = fs.readFileSync(teiObj.path, 'utf8');
  const doc = new Dom().parseFromString(xml, 'text/xml', err => {
    if (err) {
      error = {
        errCode: 1,
        errMessage: `XML parsing error: ${err}`,
      };
      docObject.errors = [];
      docObject
        .errors
        .push(error);

      return cb(error);
    }
  });

  doc.documentElement.setAttribute('source', docObject.source);
  let typeConditor;

  const evaluatorOptions = {
    node: doc,
    namespaces,
    functions: evalFunctions,
  };

  const extractMetadata = {};
  let flagSource = false;

  try {
    _.each(metadataXpaths, (metadata) => {
      extractMetadata[metadata.name] = business.extract(metadata, evaluatorOptions);
    });
  } catch (err) {
    error = {
      errCode: 2,
      errMessage: `XML path extraction error: ${err}`,
    };
    docObject.errors = [];
    docObject
      .errors
      .push(error);

    return cb(error);
  }

  _.each(mappingTD, (mapping) => {
    if (mapping.source.trim() === docObject.source.toLowerCase().trim()) {
      const td = extractMetadata.documentType;
      if (td && Array.isArray(td) && td.length > 0 && mapping.mapping[td[0]]) typeConditor = mapping.mapping[td[0]];
      // Flag set to true when the source id is present
      if (extractMetadata[mapping.nameID].trim() !== '') {
        flagSource = true;
      }
    }
  });

  // Check if the docObject has a source id
  if (flagSource === false) {
    error = {
      errCode: 3,
      errMessage: 'No source id found',
    };
    docObject.errors = [];
    docObject.errors.push(error);

    return cb(error);
  }

  // If the Conditor type is "Conférence" or "Autre" and an ISSN or EISSN
  // are present then set the Conditor type to "Article"
  if ((typeConditor === 'Conférence' || typeConditor === 'Conférence') && ((extractMetadata.issn && extractMetadata.issn.length > 0) || (extractMetadata.eissn && extractMetadata.eissn.length > 0))) {
    typeConditor = 'Article';
  }

  // If the Conditor type is "Thèse" and an ISBN is present then set the Conditor type to "Ouvrage"
  if (typeConditor === 'Thèse' && extractMetadata.isbn && extractMetadata.isbn.length > 0) {
    typeConditor = 'Ouvrage';
  }

  // If the Conditor type is "Conférence" and an ISBN is present then set the Conditor type to "Chapitre"
  if (typeConditor === 'Conférence' && extractMetadata.isbn && extractMetadata.isbn.length > 0) {
    typeConditor = 'Chapitre';
  }

  // Check if the Conditor type is set
  if (typeConditor === undefined) {
    error = {
      errCode: 4,
      errMessage: 'No Conditor type found',
    };
    docObject.errors = [];
    docObject.errors.push(error);

    return cb(error);
  }

  _.each(extractMetadata, (value, key) => {
    docObject[key] = value;
  });

  docObject.typeConditor = typeConditor;

  const nameID = sourceIdsMap[docObject.source];
  docObject.sourceId = docObject[nameID];
  docObject.sourceUid = `${docObject.source}$${docObject[nameID]}`;

  return cb();
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
        const docBloc = new Dom().parseFromString(iteSelect.toString(), 'text/xml');
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

module.exports = business;
