'use strict';

const business = {};
const Dom = require('xmldom').DOMParser;
const fs = require('fs');
const xpath = require('xpath');
const _ = require('lodash');
const mappingTD = require('co-config/metadata-mappings.json');
const metadataXpaths = require('co-config/metadata-xpaths.json');

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
  let typeConditor;
  let namespaces = {
    'TEI': 'http://www.tei-c.org/ns/1.0',
    'xmlns:hal': 'http://hal.archives-ouvertes.fr/'
  };

  const evaluatorOptions = {
    node: doc,
    namespaces: namespaces,
    functions: {
      'lower-case': function (context, arg) {
        return context
          .contextNode
          .getAttribute('type')
          .toLowerCase();
      }
    }
  };

  let extractMetadata = {};
  let regexp;
  let flagSource = false;

  function matchRegExp (metadataRegexp, value) {
    if (metadataRegexp.regexp && metadataRegexp.regexp !== '') {
      regexp = new RegExp(metadataRegexp.regexp, metadataRegexp.flag);
      return value.replace(regexp, metadataRegexp.replace);
    }
  }

  function extract (metadata, contextOptions) {
    let select;

    if (metadata.type === 'simpleString' && metadata.path) {
      select = xpath.parse(metadata.path).evaluateString(contextOptions);
      if (metadata.regexp) {
        select = matchRegExp(metadata, select);
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
        let obj = {};
        obj[metadata.attributeName] = result;
        result = obj;
      }
      return result;
    } else if (metadata.type === 'struct' && metadata.fields) {
      let obj = {};
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
          let docBloc = new Dom().parseFromString(iteSelect.toString(), 'text/xml');
          let evaluatorOptionsBloc = {
            node: docBloc,
            namespaces: namespaces,
            functions: {
              'lower-case': function (context, arg) {
                return context
                  .contextNode
                  .getAttribute('type')
                  .toLowerCase();
              }
            }
          };
          result.push(extract(metadata.fields, evaluatorOptionsBloc));
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
    }
  }

  try {
    _.each(metadataXpaths, (metadata) => {
      extractMetadata[metadata.name] = extract(metadata, evaluatorOptions);
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

  typeConditor = [];

  _.each(mappingTD, (mapping) => {
    if (mapping.source.trim() === jsonLine.source.toLowerCase().trim()) {
      // constitution du tableau Type Conditor
      _.each(extractMetadata.typeDocument, (td) => {
        typeConditor.push(mapping.mapping[td]);
      });
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
  if (!_.find(typeConditor, {type: 'Article'}) && (_.find(typeConditor, {'type': 'Conférence'}) || _.find(typeConditor, {'type': 'Autre'})) && ((extractMetadata.issn && extractMetadata.issn.length > 0) || (extractMetadata.eissn && extractMetadata.eissn.length > 0))) {
    typeConditor.push({'type': 'Article'});
  }

  // Si le tableau de type Conditor contient Thèse et qu'un isbn est présent alors
  // On remplace le type conditor Thèse par le type Ouvrage

  if (_.find(typeConditor, {type: 'Thèse'}) && extractMetadata.isbn && extractMetadata.isbn.length > 0) {
    _.pull(typeConditor, {type: 'Thèse'});
    typeConditor.push({type: 'Ouvrage'});
  }

  // Si le tableau de type Conditor contient Conférence et qu'un isbn est présent alors
  // On remplace le type Conditor Conférence par Chapitre
  if (_.find(typeConditor, {type: 'Conférence'}) && extractMetadata.isbn && extractMetadata.isbn.length > 0) {
    typeConditor.push({type: 'Chapitre'});
  }

  _.each(extractMetadata, (value, key) => {
    jsonLine[key] = value;
  });

  jsonLine.typeConditor = typeConditor;

  return cb();
};

module.exports = business;
