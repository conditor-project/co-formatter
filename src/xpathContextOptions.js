const _ = require('lodash');
const { DOMParser } = require('@xmldom/xmldom');
const xpath = require('xpath');
const { matchRegExp, isNonEmptyArray } = require('./utils');

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
 * Extracts
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extract (metadata, contextOptions) {
  let select;

  if (metadata.type === 'simpleString' && metadata.path) {
    select = xpath.parse(metadata.path).evaluateString(contextOptions);
    if (metadata.regexp) select = matchRegExp(metadata, select);

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
        return extract(field, contextOptions);
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
      obj[field.name] = extract(field, contextOptions);
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
          functions: customXPathFunctions,
        };
        const extractChild = extract(metadata.fields, evaluatorOptionsBloc);

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
        result[field.name] = extract(field, contextOptions);
      }
    });

    return result;
  }
}

module.exports = {
  namespaces,
  customXPathFunctions,
  extract,
};
