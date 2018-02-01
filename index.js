'use strict';

const business = {},
  Dom = require('xmldom').DOMParser,
  fs = require('fs'),
  xpath = require('xpath'),
  _ = require('lodash'),
  mappingTD = require('co-config/metadata-mappings.json'),
  metadataXpaths = require('co-config/metadata-xpaths.json');

business.doTheJob = function (jsonLine, cb) {

  //console.log(jsonLine.path);
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
  let type_conditor;
  let doc_bloc,
    evaluatorOptionsBloc;
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
  const rawEvaluatorOptions = {
    node: doc,
    namespaces: namespaces
  };
  let extractMetadata = {};
  let select,
    stringBloc,
    stringChamps,
    regexp;
  let flagSource = false;

  function matchRegExp(metadata_regexp, value) {
    if (metadata_regexp.regexp && metadata_regexp.regexp !== '') {
      regexp = new RegExp(metadata_regexp.regexp, metadata_regexp.flag);
      return value.replace(regexp, metadata_regexp.replace);
    }
  }

  function extract(metadata) {

    if (metadata.type === 'standard') {
      select = xpath
        .parse(metadata.path)
        .evaluateString(evaluatorOptions);
      if (metadata.regexp) {
        select = matchRegExp(metadata, select);
      }
      extractMetadata[metadata.name] = select;
    } else if (metadata.type === 'boolean') {
      select = xpath
        .parse(metadata.path)
        .evaluateBoolean(evaluatorOptions);
      extractMetadata[metadata.name] = select;
    } else if (metadata.type === 'iteration') {
      select = xpath
        .parse(metadata.path)
        .select(evaluatorOptions);
      extractMetadata[metadata.name] = [];
      if (metadata.nb === 'all') {
        _.each(select, (iteSelect) => {
          stringChamps = _.get(iteSelect, 'firstChild.data', '');
          if (metadata.regexp) {
            stringChamps = matchRegExp(metadata, stringChamps);
          }
          if (metadata.structured && metadata.structured === 'no') {
            extractMetadata[metadata.name].push(stringChamps);
          } else {
            extractMetadata[metadata.name].push({'value': stringChamps});
          }
        });
      } else {
        for (let i = 0; i < metadata.nb; i++) {
          if (select[i]) {
            stringChamps = _.get(select[i], 'firstChild.data', '');
            if (metadata.regexp) {
              stringChamps = matchRegExp(metadata, stringChamps);
            }
            if (metadata.structured && metadata.structured === 'no') {
              extractMetadata[metadata.name].push(stringChamps);
            } else {
              extractMetadata[metadata.name].push({'value': stringChamps});
            }
          }
        }
      }
    } else if (metadata.type === 'bloc') {
      select = xpath
        .parse(metadata.path)
        .select(evaluatorOptions);
      extractMetadata[metadata.name] = [];
      stringBloc = '';
      if (metadata.bloc.nb === 'all') {
        _.each(select, (iteSelect) => {
          doc_bloc = new Dom().parseFromString(iteSelect.toString(), 'text/xml');
          evaluatorOptionsBloc = {
            node: doc_bloc,
            namespaces: namespaces
          };
          _.each(metadata.bloc.champs, (metadata_bloc) => {
            stringChamps = _.get(xpath.parse(metadata_bloc.path).select(evaluatorOptionsBloc), '[0]firstChild.data', '');
            if (metadata_bloc.regexp) {
              stringChamps = matchRegExp(metadata_bloc, stringChamps);
            }
            stringBloc += stringChamps;
            stringBloc += metadata.bloc.separateur;
          });
          stringBloc += metadata.separateur;
        });
      } else if (typeof metadata.bloc.nb === 'number') {
        for (let j = 0; j < metadata.bloc.nb; j++) {
          if (select[j]) {
            doc_bloc = new Dom().parseFromString(select[j].toString(), 'text/xml');
            evaluatorOptionsBloc = {
              node: doc_bloc,
              namespaces: namespaces
            };
            _.each(metadata.bloc.champs, (metadata_bloc) => {
              stringChamps = _.get(xpath.parse(metadata_bloc.path).select(evaluatorOptionsBloc), '[0]firstChild.data', '');
              if (metadata_bloc.regexp) {
                stringChamps = matchRegExp(metadata_bloc, stringChamps);
              }
              stringBloc += stringChamps;
              stringBloc += metadata.bloc.separateur;
            });
            stringBloc += metadata.separateur;
          }
        }
      }
      extractMetadata[metadata.name] = stringBloc;
    }
  }

  try {
    _.each(metadataXpaths, (metadata) => {
      extract(metadata);
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

  type_conditor = [];

  _.each(mappingTD, (mapping) => {
    if (mapping.source.trim() === jsonLine.source.toLowerCase().trim()) {
      //constitution du tableau Type Conditor
      _.each(extractMetadata.typeDocument, (td) => {
        type_conditor.push(mapping.mapping[td.value]);
      });
      //flag vérifiant si l'id source est bien présent
      if (extractMetadata[mapping.nameID].trim() !== '') {
        flagSource = true;
      }
    }
  });

  //Vérification de la présence d'un idSource
  if (flagSource === false) {
    error = {
      errCode: 3,
      errMessage: 'erreur d\'identification. Pas d\'id source.'
    };
    jsonLine.errors = [];
    jsonLine
      .errors
      .push(error);
    return cb(error);
  }

  // Si le tableau de type conditor contient Conférence ou Autre et qu'un issn ou
  // eissn est présent alors on ajoute le type conditor Article s il n'est pas
  // déjà présent.
  if (!_.find(type_conditor, {type: 'Article'}) && (_.find(type_conditor, {'type': 'Conférence'}) || _.find(type_conditor, {'type': 'Autre'})) && (extractMetadata.issn.trim() !== '' || extractMetadata.eissn.trim() !== '')) {
    type_conditor.push({'type': 'Article'});
  }


  // Si le tableau de type Conditor contient Thèse et qu'un isbn est présent alors 
  // On remplace le type conditor Thèse par le type Ouvrage

  if (_.find(type_conditor, {type:'Thèse'} && extractMetadata.isbn.trim()!=='')){
    _.pull(type_conditor,{type:'Thèse'});
    type_conditor.push({type:'Ouvrage'});
  }

  // Si le tableau de type Conditor contient Conférence et qu'un isbn est présent alors
  // On remplace le type Conditor Conférence par Chapitre

  if (_.find(type_conditor, {type:'Conférence'} && extractMetadata.isbn.trim()!=='')){
    type_conditor.push({type:'Chapitre'});
  }

  //console.log(extractMetadata);

  _.each(extractMetadata, (value, key) => {
    if (typeof value === 'string') {
      value = value.trim();
      jsonLine[key] = {
        'value': value
      };
    } else if (Array.isArray(value) || typeof(value) === 'boolean') {
      jsonLine[key] = value;
    } else {
      jsonLine[key] = {
        'value': value
      };
    }
  });

  jsonLine.typeConditor = type_conditor;

  return cb();

};

module.exports = business;
