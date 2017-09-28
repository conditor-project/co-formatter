'use strict';

const business = {},
  dom = require('xmldom').DOMParser,
  fs = require('fs'),
  xpath = require('xpath'),
  _ = require('lodash'),
  mappingTD = require('./metadata-mappings.json');


business.doTheJob = function (jsonLine, cb) {


  //console.log(jsonLine.path);

  let xml = fs.readFileSync(jsonLine.path, 'utf8');
  let doc = new dom().parseFromString(xml, 'text/xml');
  let namespaces = {'TEI': 'http://www.tei-c.org/ns/1.0', 'xmlns:hal': 'http://hal.archives-ouvertes.fr/'};
  let issn_nodes, issn_nodes_select,
    eissn_nodes,eissn_nodes_select,
    isbn_nodes,isbn_nodes_select,
    ut_nodes,ut_nodes_select,
    doi_nodes, doi_nodes_select,
    arxiv_nodes, arxiv_nodes_select,
    pubmed_nodes, pubmed_nodes_select,
    nnt_nodes, nnt_nodes_select,
    patent_number_nodes, patent_number_nodes_select,
    numero_nodes, numero_nodes_select,
    page_nodes, page_nodes_select,
    volume_nodes, volume_nodes_select,
    idhal_nodes,idhal_nodes_select,
    halauthorid_nodes_select,
    orcid_nodes,orcid_nodes_select,
    researcherid_nodes,researcherid_nodes_select,
    viaf_nodes,viaf_nodes_select,
    type_document_nodes_select,
    type_document_nodes,type_conditor,
    date_publi_nodes,date_publi,
    titre_source_nodes,titre_source;

  let halauthorid_nodes ='';
  
  const metadataXpaths = require(__dirname + '/metadata-xpaths.json');

  const evaluatorOptions = {node: doc, namespaces: namespaces};

  let title = xpath.parse(metadataXpaths.titre).evaluateString(evaluatorOptions);
  let titlefr = xpath.parse(metadataXpaths.titrefr).evaluateString(evaluatorOptions);
  let titleen = xpath.parse(metadataXpaths.titreen).evaluateString(evaluatorOptions);

  let persname_nodes = xpath.parse(metadataXpaths.persNames).select(evaluatorOptions);

  issn_nodes_select = xpath.parse(metadataXpaths.issn).select(evaluatorOptions);
  if (issn_nodes_select[0] && issn_nodes_select[0].data)
    issn_nodes = issn_nodes_select[0].data;
  else
    issn_nodes = '';

  eissn_nodes_select = xpath.parse(metadataXpaths.eissn).select(evaluatorOptions);
  if (eissn_nodes_select[0] && eissn_nodes_select[0].data)
    eissn_nodes = eissn_nodes_select[0].data;
  else
    eissn_nodes = '';

  isbn_nodes_select = xpath.parse(metadataXpaths.isbn).select(evaluatorOptions);
  if (isbn_nodes_select[0] && isbn_nodes_select[0].data)
    isbn_nodes = isbn_nodes_select[0].data;
  else
    isbn_nodes = '';

  ut_nodes_select = xpath.parse(metadataXpaths.ut).select(evaluatorOptions);
  if (ut_nodes_select[0] && ut_nodes_select[0].data)
    ut_nodes = ut_nodes_select[0].data;
  else
    ut_nodes = '';

  doi_nodes_select = xpath.parse(metadataXpaths.doi).select(evaluatorOptions);
  if (doi_nodes_select[0] && doi_nodes_select[0].data)
    doi_nodes = doi_nodes_select[0].data;
  else
    doi_nodes = '';
  
  arxiv_nodes_select = xpath.parse(metadataXpaths.arxiv).select(evaluatorOptions);
  if (arxiv_nodes_select[0] && arxiv_nodes_select[0].data)
    arxiv_nodes = arxiv_nodes_select[0].data;
  else
    arxiv_nodes = '';

  pubmed_nodes_select = xpath.parse(metadataXpaths.pubmed).select(evaluatorOptions);
  if (pubmed_nodes_select[0] && pubmed_nodes_select[0].data)
    pubmed_nodes = pubmed_nodes_select[0].data;
  else
    pubmed_nodes = '';

  nnt_nodes_select = xpath.parse(metadataXpaths.nnt).select(evaluatorOptions);
  if (nnt_nodes_select[0] && nnt_nodes_select[0].data)
    nnt_nodes = nnt_nodes_select[0].data;
  else
    nnt_nodes = '';

  patent_number_nodes_select = xpath.parse(metadataXpaths.patentNumber).select(evaluatorOptions);
  if (patent_number_nodes_select[0] && patent_number_nodes_select[0].data)
    patent_number_nodes = patent_number_nodes_select[0].data;
  else
    patent_number_nodes = '';

  numero_nodes_select = xpath.parse(metadataXpaths.numero).select(evaluatorOptions);
  if (numero_nodes_select[0] && numero_nodes_select[0].data)
    numero_nodes = numero_nodes_select[0].data;
  else
    numero_nodes = '';


  page_nodes_select = xpath.parse(metadataXpaths.page).select(evaluatorOptions);
  if (page_nodes_select[0] && page_nodes_select[0].data)
    page_nodes = page_nodes_select[0].data;
  else
    page_nodes = '';

  volume_nodes_select = xpath.parse(metadataXpaths.volume).select(evaluatorOptions);
  if (volume_nodes_select[0] && volume_nodes_select[0].data)
    volume_nodes = volume_nodes_select[0].data;
  else
    volume_nodes = '';


  idhal_nodes_select = xpath.parse(metadataXpaths.idhal).select(evaluatorOptions);
  if (idhal_nodes_select[0] && idhal_nodes_select[0].data)
    idhal_nodes = idhal_nodes_select[0].data;
  else
    idhal_nodes = '';

  // à décider comment on organise les identifiants auteurs (même limite que le nombre d'auteur ? )
  let authorid_count=0;
  halauthorid_nodes_select = xpath.parse(metadataXpaths.halauthorid).select(evaluatorOptions);
  halauthorid_nodes_select.forEach(function(halauthorid_node){
    //if (authorid_count<3){
      halauthorid_nodes += ''+halauthorid_node.firstChild+' ';
      authorid_count++;
    //}
  });
  
  if (halauthorid_nodes_select[0] && halauthorid_nodes_select[0].data)
    idhal_nodes = idhal_nodes_select[0].data;
  else
    idhal_nodes = '';

  orcid_nodes_select = xpath.parse(metadataXpaths.orcid).select(evaluatorOptions);
  if (orcid_nodes_select[0] && orcid_nodes_select[0].data)
    orcid_nodes = orcid_nodes_select[0].data;
  else
    orcid_nodes = '';

  researcherid_nodes_select = xpath.parse(metadataXpaths.researcherid).select(evaluatorOptions);
  if (researcherid_nodes_select[0] && researcherid_nodes_select[0].data)
    researcherid_nodes = researcherid_nodes_select[0].data;
  else
    researcherid_nodes = '';

  viaf_nodes_select = xpath.parse(metadataXpaths.viaf).select(evaluatorOptions);
  if (viaf_nodes_select[0] && viaf_nodes_select[0].data)
    viaf_nodes = viaf_nodes_select[0].data;
  else
    viaf_nodes = '';

  type_document_nodes_select = xpath.parse(metadataXpaths.typeDocument).select(evaluatorOptions);
  if (type_document_nodes_select[0] && type_document_nodes_select[0].value)
    type_document_nodes = type_document_nodes_select[0].value;
  else
    type_document_nodes = '';

  titre_source_nodes=xpath.parse(metadataXpaths.titre_source).select(evaluatorOptions);
  if (titre_source_nodes[0] && titre_source_nodes[0].value)
    titre_source = titre_source_nodes[0].value;
  else 
    titre_source = '';

  date_publi_nodes=xpath.parse(metadataXpaths.datePubli).select(evaluatorOptions);
  if (date_publi_nodes[0] && date_publi_nodes[0].value)
    date_publi = date_publi_nodes[0].value;
  else 
    date_publi = '';

  
  _.each(mappingTD,(mapping)=>{
    if (mapping.source.trim()===jsonLine.source.trim()) type_conditor = mapping.mapping[type_document_nodes];
  });

  if (type_conditor===undefined) type_conditor={'type':''};


  if ((type_conditor.type.trim()==='Conférence' || type_conditor.type.trim()==='Autre') && (issn_nodes.trim()!=='' || eissn_nodes.trim()!=='')){
    type_conditor.type+=' Article';
  }

  let champs_unique = '';

  let champs_unique_init = '';

  let count = 0;

  let surname,forename;

  persname_nodes.forEach(function (persname_node) {
    if (count < 3) {
      let doc_autor = new dom().parseFromString(persname_node.toString(), 'text/xml');
      const evaluatorOptionsAuthor = {node: doc_autor, namespaces: namespaces};
      let forename_node = xpath.parse(metadataXpaths.forename).select(evaluatorOptionsAuthor);
      let surname_node = xpath.parse(metadataXpaths.surname).select(evaluatorOptionsAuthor);
      
      if (surname_node!==undefined && surname_node[0] && surname_node[0].firstChild)
        surname=surname_node[0].firstChild;
      else 
        surname='';

      if (forename_node!==undefined && forename_node[0] && forename_node[0].firstChild)
        forename=forename_node[0].firstChild;
      else 
        forename='';

      
      champs_unique += '' + surname + ' ' + forename + ' ';
      champs_unique_init += '' + surname + ' ' + forename.toString().trim().charAt(0) + ' ';
      count++;
    }
  });


  /**
   console.log('######################');
   console.log(title.toString());
   console.log('######################');
   console.log(champs_unique);
   console.log('######################');
   console.log(doi_nodes);
   console.log('######################');
   console.log(issn_nodes);
   console.log('######################');
   console.log(numero_nodes);
   console.log('######################');
   console.log(page_nodes);
   console.log('######################');
   console.log(volume_nodes);
   **/
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
  jsonLine.typeConditor = type_conditor.type.trim();
  //console.log(jsonLine);


  return cb();

};


module.exports = business;