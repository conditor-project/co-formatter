'use strict';

const Dom = require('xmldom').DOMParser;
const fs = require('fs');
const xpath = require('xpath');
const _ = require('lodash');
const metadataXpaths = require('co-config/metadata-xpaths.json');
const mappingTD = require('co-config/metadata-mappings.json');
const sourceIdsMap = _.transform(mappingTD, (sourceIds, { source, nameID }) => sourceIds[source] = nameID, {});

const namespaces = {
  'TEI': 'http://www.tei-c.org/ns/1.0',
  'xmlns:hal': 'http://hal.archives-ouvertes.fr/',
  'str': 'http://exslt.org/strings'
};

const business = {};

const evalfunctions = {
  'lower-case': function (context, arg) {
    return context
      .contextNode
      .getAttribute('type')
      .toLowerCase();
  },
  'first-of-split': function(context, text,separator) {
    const elems = _.split(text,separator);
    const compacted = _.compact(elems);
    return (Array.isArray(compacted) && compacted.length > 0) ? compacted[0] : "";
  }
};

business.doTheJob = function (jsonLine, cb) {
  let error;
  let xml = fs.readFileSync(jsonLine.path, 'utf8');
  let doc = new Dom().parseFromString(xml, 'text/xml', function (err) {
    if (err) {
      error = {
        errCode: 1,
        errMessage: 'erreur de parsing XML : ' + err
      };
      jsonLine.errors = [];
      jsonLine
        .errors
        .push(error);
      return cb(error);
    }
  });
  let typeConditor = 'Autre';

  const evaluatorOptions = {
    node: doc,
    namespaces: namespaces,
    functions: evalfunctions
  };

  let extractMetadata = {};
  let flagSource = false;

  try {
    _.each(metadataXpaths, (metadata) => {
      extractMetadata[metadata.name] = this.extract(metadata, evaluatorOptions);
    });
  } catch (err) {
    error = {
      errCode: 2,
      errMessage: 'erreur d\'extraction de path XML : ' + err
    };
    jsonLine.errors = [];
    jsonLine
      .errors
      .push(error);
    return cb(error);
  }

  _.each(mappingTD, (mapping) => {
    if (mapping.source.trim() === jsonLine.source.toLowerCase().trim()) {
      // récupération du type Conditor (auparavant un tableau, maintenant mono-valué)
      const td = extractMetadata.documentType;
      if (td && Array.isArray(td) && td.length > 0) typeConditor = mapping.mapping[td[0]];
      // flag vérifiant si l'id source est bien présent
      if (extractMetadata[mapping.nameID].trim() !== '') {
        flagSource = true;
      }
    }
  });

  // Vérification de la présence d'un idSource
  if (flagSource === false) {
    error = {
      errCode: 3,
      errMessage: 'erreur d\'identification. Pas d\'id source.'
    };
    jsonLine.errors = [];
    jsonLine.errors.push(error);
    return cb(error);
  }

  // Si le tableau de type conditor contient Conférence ou Autre et qu'un issn ou
  // eissn est présent alors on ajoute le type conditor Article s il n'est pas
  // déjà présent.
  if ((typeConditor === 'Conférence' || typeConditor === 'Conférence') && ((extractMetadata.issn && extractMetadata.issn.length > 0) || (extractMetadata.eissn && extractMetadata.eissn.length > 0))) {
    typeConditor = 'Article';
  }

  // Si le tableau de type Conditor contient Thèse et qu'un isbn est présent alors
  // On remplace le type conditor Thèse par le type Ouvrage

  if (typeConditor === 'Thèse' && extractMetadata.isbn && extractMetadata.isbn.length > 0) {
    typeConditor = 'Ouvrage';
  }

  // Si le tableau de type Conditor contient Conférence et qu'un isbn est présent alors
  // On remplace le type Conditor Conférence par Chapitre
  if (typeConditor === 'Conférence' && extractMetadata.isbn && extractMetadata.isbn.length > 0) {
    typeConditor = 'Chapitre';
  }

  _.each(extractMetadata, (value, key) => {
    jsonLine[key] = value;
  });

  jsonLine.typeConditor = typeConditor;

  const nameID = sourceIdsMap[jsonLine.source];
  jsonLine.sourceId = jsonLine[nameID];
  jsonLine.sourceUid = jsonLine.source + '$' + jsonLine[nameID];

  return cb();
};

business.matchRegExp = function (metadataRegexp, value) {
  if (metadataRegexp.regexp && metadataRegexp.regexp !== '') {
    const regexp = new RegExp(metadataRegexp.regexp, metadataRegexp.flag);
    return value.replace(regexp, metadataRegexp.replace);
  }
};

business.extract = function (metadata, contextOptions) {
  let select;

  if (metadata.type === 'simpleString' && metadata.path) {
    select = xpath.parse(metadata.path).evaluateString(contextOptions);
    if (metadata.regexp) {
      select = this.matchRegExp(metadata, select);
    }
    if (metadata.attributeName && metadata.attributeName.trim() !== '') {
      let obj = {};
      obj[metadata.attributeName] = select;
      select = obj;
    }
    return select;
  } else if (metadata.type === 'boolean' && metadata.path) {
    select = xpath.parse(metadata.path).evaluateBoolean(contextOptions);
    if (metadata.attributeName && metadata.attributeName.trim() !== '') {
      let obj = {};
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
        return this.extract(field, contextOptions);
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
      let obj = {};
      obj[metadata.attributeName] = result;
      result = obj;
    }
    return result;
  } else if (metadata.type === 'struct' && metadata.fields) {
    let obj = {};
    _.each(metadata.fields, (field) => {
      obj[field.name] = this.extract(field, contextOptions);
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
        let docBloc = new Dom().parseFromString(iteSelect.toString(), 'text/xml');
        let evaluatorOptionsBloc = {
          node: docBloc,
          namespaces: namespaces,
          functions: evalfunctions
        };
        result.push(this.extract(metadata.fields, evaluatorOptionsBloc));
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
      let obj = {};
      obj[metadata.attributeName] = result;
      result = obj;
    }
    return result;
  } else if (metadata.type === 'object' && metadata.name && metadata.fields) {
    const result = {};
    _.each(metadata.fields, (field) => {
      if (field.name && field.name !== '') {
        result[field.name] = this.extract(field, contextOptions);
      }
    });
    return result;
  }
};

module.exports = business;
