const _ = require('lodash');
const { DOMParser } = require('@xmldom/xmldom');
const xpath = require('xpath');
const { matchRegExp, isNonEmptyObject, isNonEmptyArray, isNonEmptyString } = require('./utils');

const namespaces = {
  TEI: 'http://www.tei-c.org/ns/1.0',
  'xmlns:hal': 'http://hal.archives-ouvertes.fr/',
  str: 'http://exslt.org/strings',
};

const customXPathFunctions = {
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

/**
 * Extracts a string.
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extractSimpleString (metadata, contextOptions) {
  let select = xpath.parse(metadata.path).evaluateString(contextOptions);
  if (metadata.regexp) select = matchRegExp(metadata, select);

  if (isNonEmptyString(metadata.attributeName)) {
    const obj = {};
    obj[metadata.attributeName] = select;
    select = obj;
  }

  if (select === '' && metadata.allowEmpty === false) return undefined;

  return select;
}

/**
 * Extracts a boolean.
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extractBoolean (metadata, contextOptions) {
  let select = xpath.parse(metadata.path).evaluateBoolean(contextOptions);
  if (isNonEmptyString(metadata.attributeName)) {
    const obj = {};
    obj[metadata.attributeName] = select;
    select = obj;
  }

  return select;
}

/**
 * Extracts an array.
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extractArray (metadata, contextOptions) {
  let limited = false;
  let limit = 0;

  if (metadata.limit) {
    limited = true;
    limit = metadata.limit;
  }

  let result = _.values(_.mapValues(metadata.fields, field => {
    if (!limited || limit > 0) {
      limit--;
      return extract(field, contextOptions);
    }
  }));

  if (metadata.concat === true && metadata.separator) {
    result = result.join(metadata.separator);
  }

  if (isNonEmptyString(metadata.attributeName)) {
    const obj = {};
    obj[metadata.attributeName] = result;
    result = obj;
  }

  return result;
}

/**
 * Extracts a struct.
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extractStruct (metadata, contextOptions) {
  const obj = {};
  metadata.fields.forEach(field => {
    obj[field.name] = extract(field, contextOptions);
  });

  return obj;
}

/**
 * Extracts a bloc.
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extractBloc (metadata, contextOptions) {
  let result = [];
  let limited = false;
  let limit = 0;

  if (metadata.limit) {
    limited = true;
    limit = metadata.limit;
  }

  const select = xpath.parse(metadata.path).select(contextOptions);
  _.each(select, iteSelect => {
    if (!limited || limit > 0) {
      const docBloc = new DOMParser().parseFromString(iteSelect.toString(), 'text/xml');
      const evaluatorOptionsBloc = {
        node: docBloc,
        namespaces: namespaces,
        functions: customXPathFunctions,
      };
      const extractChild = extract(metadata.fields, evaluatorOptionsBloc);

      if (extractChild) result.push(extractChild);
      limit--;
    }
  });
  if (metadata.concat === true && metadata.separator) {
    result = result.join(metadata.separator);
  }
  if (isNonEmptyString(metadata.attributeName)) {
    const obj = {};
    obj[metadata.attributeName] = result;
    result = obj;
  }

  return result;
}

/**
 * Extracts an object
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extractObject (metadata, contextOptions) {
  const result = {};
  metadata.fields.forEach(field => {
    if (isNonEmptyString(field.name)) {
      result[field.name] = extract(field, contextOptions);
    }
  });

  return result;
}

/**
 * Extracts.
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extract (metadata, contextOptions) {
  if (metadata.type === 'simpleString' && isNonEmptyString(metadata.path)) {
    return extractSimpleString(metadata, contextOptions);
  } else if (metadata.type === 'boolean' && isNonEmptyString(metadata.path)) {
    return extractBoolean(metadata, contextOptions);
  } else if (metadata.type === 'array' && isNonEmptyArray(metadata.fields)) {
    return extractArray(metadata, contextOptions);
  } else if (metadata.type === 'struct' && isNonEmptyArray(metadata.fields)) {
    return extractStruct(metadata, contextOptions);
  } else if (metadata.type === 'bloc' && isNonEmptyString(metadata.path) && isNonEmptyObject(metadata.fields)) {
    return extractBloc(metadata, contextOptions);
  } else if (metadata.type === 'object' && isNonEmptyString(metadata.name) && isNonEmptyArray(metadata.fields)) {
    return extractObject(metadata, contextOptions);
  }
}

module.exports = {
  namespaces,
  customXPathFunctions,
  extract,
};
