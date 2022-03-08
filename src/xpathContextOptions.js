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
};

const extractTypeHandlers = {
  simpleString: (metadata, contextOptions) => {
    if (!isNonEmptyString(metadata.path)) return;

    let result = xpath.parse(metadata.path).evaluateString(contextOptions);
    if (metadata.regexp) result = matchRegExp(metadata, result);

    if (result === '' && metadata.allowEmpty === false) return undefined;

    return result;
  },
  boolean: (metadata, contextOptions) => {
    if (!isNonEmptyString(metadata.path)) return;

    return xpath.parse(metadata.path).evaluateBoolean(contextOptions);
  },
  array: (metadata, contextOptions) => {
    if (!isNonEmptyArray(metadata.fields)) return;

    let result;
    let iterations = 0;

    result = _.values(_.mapValues(metadata.fields, field => {
      if (!_.isInteger(metadata.limit) || iterations <= metadata.limit) {
        iterations++;
        return extract(field, contextOptions);
      }
    }));

    if (metadata.concat === true && isNonEmptyString(metadata.separator)) {
      // Only keep the non empty strings of the results then join them
      result = _.compact(result).join(metadata.separator);
    }

    return result;
  },
  bloc: (metadata, contextOptions) => {
    if (!isNonEmptyString(metadata.path) || !isNonEmptyObject(metadata.fields)) return;

    let result = [];

    const select = xpath.parse(metadata.path).select(contextOptions);
    for (let i = 0; i < select.length; i++) {
      const docBloc = new DOMParser().parseFromString(select[i].toString(), 'text/xml');
      const evaluatorOptionsBloc = {
        node: docBloc,
        namespaces: namespaces,
        functions: customXPathFunctions,
      };
      const extractChild = extract(metadata.fields, evaluatorOptionsBloc);

      if (extractChild) result.push(extractChild);

      // If a limit is defined and the number of iterations (i + 1) is greater or equal
      // to the limit, then exit the loop early
      if (_.isInteger(metadata.limit) && metadata.limit <= i + 1) {
        break;
      }
    }

    if (metadata.concat === true && metadata.separator) {
      result = result.join(metadata.separator);
    }

    return result;
  },
  object: (metadata, contextOptions) => {
    if (!isNonEmptyArray(metadata.fields)) return;

    const result = {};
    metadata.fields.forEach(field => {
      if (isNonEmptyString(field.name)) {
        result[field.name] = extract(field, contextOptions);
      }
    });

    return result;
  },
};

/**
 * Extracts the requested `metadata` from a TEI document.
 * @param {object} metadata The metadata info coming from `co-config`.
 * @param {object} contextOptions The context options passed to `xpath` evaluation methods.
 */
function extract (metadata, contextOptions) {
  if (extractTypeHandlers[metadata.type]) {
    const result = extractTypeHandlers[metadata.type](metadata, contextOptions);

    if (isNonEmptyString(metadata.attributeName)) {
      return { [metadata.attributeName]: result };
    }

    return result;
  }
}

module.exports = {
  namespaces,
  customXPathFunctions,
  extract,
};
