'use strict';

const business = {},
  dom = require('xmldom').DOMParser,
  fs = require('fs'),
  xpath = require('xpath'),
  _ = require('lodash'),
  mappingTD = require('./metadata-mappings.json'),
  metadataXpaths = require(__dirname + '/metadata-xpaths.json');


business.doTheJob = function (jsonLine, cb) {


  //console.log(jsonLine.path);
  let error;
  let xml = fs.readFileSync(jsonLine.path, 'utf8');
  let doc = new dom().parseFromString(xml, 'text/xml',function(err) {
    if (err) {
        error = {
            errCode: 1,
            errMessage: 'erreur de parsing XML : ' + err
        };
        jsonLine.errors=[];
        jsonLine.errors.push(error);
        return cb(error);
    }
  });
  let type_conditor;
  let doc_bloc,evaluatorOptionsBloc;
  let namespaces = {'TEI': 'http://www.tei-c.org/ns/1.0', 'xmlns:hal': 'http://hal.archives-ouvertes.fr/'};
  
  
  const evaluatorOptions = {node: doc, namespaces: namespaces};
  let extractMetadata = {};
  let select,stringBloc,stringChamps,regexp;
  let flagSource=false;
  
  function matchRegExp(metadata_regexp,value){
    if (metadata_regexp.regexp && metadata_regexp.regexp!==''){
      regexp = new RegExp(metadata_regexp.regexp,metadata_regexp.flag);
      return value.replace(regexp,metadata_regexp.replace);
    }
  }

  function extract(metadata){

    if (metadata.type==='standard'){
      select = xpath.parse(metadata.path).evaluateString(evaluatorOptions);
      if (metadata.regexp){
       select= matchRegExp(metadata,select);
      }
      extractMetadata[metadata.name] = select;
    }
    else if (metadata.type==='iteration'){
      select = xpath.parse(metadata.path).select(evaluatorOptions);
      extractMetadata[metadata.name] = [];
      if (metadata.nb==='all'){
        _.each(select,(iteSelect)=>{
          stringChamps = _.get(iteSelect,'firstChild.data','');
          if (metadata.regexp) stringChamps = matchRegExp(metadata,stringChamps);
          extractMetadata[metadata.name].push({'value':stringChamps});
        });
      }
      else{
        for (let i=0;i<metadata.nb;i++){
          if (select[i]){
            stringChamps = _.get(select[i],'firstChild.data','');
            if (metadata.regexp){
              stringChamps = matchRegExp(metadata,stringChamps);
            }
            extractMetadata[metadata.name].push({'value':stringChamps});
          }
        }
      }
    }
    else if (metadata.type==='bloc'){
      select = xpath.parse(metadata.path).select(evaluatorOptions);
      extractMetadata[metadata.name] = [];
      stringBloc="";
      if (metadata.bloc.nb==='all'){
        _.each(select,(iteSelect)=>{
          doc_bloc = new dom().parseFromString(iteSelect.toString(), 'text/xml');
          evaluatorOptionsBloc = {node: doc_bloc, namespaces: namespaces};
          _.each(metadata.bloc.champs,(metadata_bloc)=>{
            stringChamps=_.get(xpath.parse(metadata_bloc.path).select(evaluatorOptionsBloc),'[0]firstChild.data','');
            if (metadata_bloc.regexp){
              stringChamps = matchRegExp(metadata_bloc,stringChamps);
            }
            stringBloc+= stringChamps;
            stringBloc+=metadata.bloc.separateur;
          });
          stringBloc+=metadata.separateur;
        });
      }
      else if (typeof metadata.bloc.nb==='number'){
        for (let j=0;j<metadata.bloc.nb;j++){
          if (select[j]){
            doc_bloc = new dom().parseFromString(select[j].toString(), 'text/xml');
            evaluatorOptionsBloc = {node: doc_bloc, namespaces: namespaces};
            _.each(metadata.bloc.champs,(metadata_bloc)=>{
              stringChamps=_.get(xpath.parse(metadata_bloc.path).select(evaluatorOptionsBloc),'[0]firstChild.data','');
              if (metadata_bloc.regexp){
                stringChamps = matchRegExp(metadata_bloc,stringChamps);
              }
              stringBloc+= stringChamps;
              stringBloc+=metadata.bloc.separateur;
            });
            stringBloc+=metadata.separateur;
          }
        }
      }
      extractMetadata[metadata.name]=stringBloc;
    }
  }
  
 
  try{
    _.each(metadataXpaths,(metadata)=>{
      extract(metadata);
    });
  }
  catch (err){
    error = {
      errCode: 2,
      errMessage: 'erreur d\'extraction de path XML : ' + err
    };
    jsonLine.errors=[];
    jsonLine.errors.push(error);
    return cb(error);
  }
  
  type_conditor=[];
  
  _.each(mappingTD,(mapping)=>{
    if (mapping.source.trim()===jsonLine.source.toLowerCase().trim()){
       type_conditor.push(mapping.mapping[extractMetadata.typeDocument] ||  {'type':'Article'});
       if (extractMetadata[mapping.nameID].trim()!=='') flagSource=true; 
    }
  });

  //Vérification de la présence d'un idSource
  if (flagSource===false){
    error = {
      errCode: 3,
      errMessage: 'erreur d\'identification. Pas d\'id source.'
    };
    jsonLine.errors=[];
    jsonLine.errors.push(error);
    return cb(error);
  }

  // Si le type conditor est Conférence ou Autre et qu'un issn ou eissn est présent alors on ajoute le type conditor Article.
  if ((type_conditor[0]==='Conférence' || type_conditor[0]==='Autre') && (extractMetadata.issn.trim()!=='' || extractMetadata.issn!=='')){
    type_conditor.push({'type':'Article'});
}

  //console.log(extractMetadata);

  let idprodinra_nodes='';

  _.each(extractMetadata,(value,key)=>{
    if (typeof value ==='string') value = value.trim();
    jsonLine[key]={'value':value};
  });

  jsonLine.idprodinra = {'value':idprodinra_nodes};
  jsonLine.typeConditor = type_conditor;


  return cb();

};


module.exports = business;