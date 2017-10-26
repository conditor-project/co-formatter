'use strict';

const business = {},
  dom = require('xmldom').DOMParser,
  fs = require('fs'),
  xpath = require('xpath'),
  _ = require('lodash'),
  mappingTD = require('./metadata-mappings.json');


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
        return cb(error);
    }
  });
  let type_conditor;
  let doc_bloc,evaluatorOptionsBloc;
  let namespaces = {'TEI': 'http://www.tei-c.org/ns/1.0', 'xmlns:hal': 'http://hal.archives-ouvertes.fr/'};
  
  const metadataXpaths = require(__dirname + '/metadata-xpaths.json');
  const evaluatorOptions = {node: doc, namespaces: namespaces};
  let extractMetadata = {};
  let select,stringBloc,stringChamps,regexp;

  _.each(metadataXpaths,(metadata)=>{
    if (metadata.type==='standard'){
      select = xpath.parse(metadata.path).evaluateString(evaluatorOptions);
      extractMetadata[metadata.name] = select;
    }
    else if (metadata.type==='iteration'){
      select = xpath.parse(metadata.path).select(evaluatorOptions);
      extractMetadata[metadata.name] = [];
      if (metadata.nb==='all'){
        _.each(select,(iteSelect)=>{
          extractMetadata[metadata.name].push({'value':_.get(iteSelect,'firstChild.data','')});
        });
      }
      else{
        for (let i=0;i<metadata.nb;i++){
          if (select[i]) extractMetadata[metadata.name].push({'value':_.get(select[i],'firstChild.data','')});
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
            if (metadata.regexp){

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
                regexp = new RegExp(metadata_bloc.regexp,metadata_bloc.flag);
                stringChamps = stringChamps.replace(regexp,metadata_bloc.replace);
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
  });
  

  type_conditor=[];
  
  _.each(mappingTD,(mapping)=>{
    if (mapping.source.trim()===jsonLine.source.toLowerCase().trim()){
       type_conditor.push(mapping.mapping[extractMetadata.typeDocument] ||  {'type':'Article'});
    }
  });


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

  /**
  jsonLine.titre = {'value': title.toString().trim()};
  jsonLine.titrefr = {'value': titlefr.toString().trim()};
  jsonLine.titreen = {'value':titleen.toString().trim()};
  jsonLine.auteur = {'value': champs_unique.trim()};
  jsonLine.auteur_init = {'value': champs_unique_init.trim()};
  jsonLine.doi = {'value': doi_nodes.trim()};
  jsonLine.arxiv = {'value':arxiv_nodes.trim()};
  jsonLine.pubmed = {'value':pubmed_nodes.trim()};
  jsonLine.nnt = {'value':nnt_nodes.trim()};
  jsonLine.patentNumber = {'value':patent_number_nodes.trim()};
  jsonLine.ut = {'value':ut_nodes.trim()};
  jsonLine.issn = {'value': issn_nodes.trim()};
  jsonLine.eissn = {'value': eissn_nodes.trim()};
  jsonLine.isbn = {'value': isbn_nodes.trim()};
  jsonLine.numero = {'value': numero_nodes.trim()};
  jsonLine.page = {'value': page_nodes.trim()};
  jsonLine.volume = {'value': volume_nodes.trim()};
  jsonLine.idhal = {'value':idhal_nodes.trim()};
  jsonLine.halauthorid = {'value':halauthorid_nodes.trim()};
  jsonLine.orcid = {'value':orcid_nodes.trim()};
  jsonLine.researcherid = {'value':researcherid_nodes.trim()};
  jsonLine.viaf = {'value':viaf_nodes.trim()};
  jsonLine.typeDocument = {'value':type_document_nodes.trim()};
  jsonLine.titreSource = {'value':titre_source.trim()}; 
  jsonLine.datePubli = {'value':date_publi.trim()};
  
  **/
  jsonLine.idprodinra = {'value':idprodinra_nodes};
  jsonLine.typeConditor = type_conditor;


  return cb();

};


module.exports = business;