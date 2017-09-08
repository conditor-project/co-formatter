'use strict';

const business = {},
    dom = require('xmldom').DOMParser,
    fs = require('fs'),
    xpath = require('xpath');


business.doTheJob = function(jsonLine, cb) {


    console.log(jsonLine.path);

    let xml = fs.readFileSync(jsonLine.path, 'utf8');
    let doc = new dom().parseFromString(xml, 'text/xml');
    let select = xpath.useNamespaces({ 'xmlns': 'http://www.tei-c.org/ns/1.0', 'xmlns:hal': 'http://hal.archives-ouvertes.fr/' });
    let issn_nodes, issn_nodes_select,
        doi_nodes, doi_nodes_select,
        numero_nodes, numero_nodes_select,
        page_nodes, page_nodes_select,
        volume_nodes, volume_nodes_select;

    const metadataXpaths = require(__dirname+"/metadata-xpaths.json");

    let title = select(metadataXpaths.titre, doc);

    let persname_nodes = select(metadataXpaths.persNames, doc);

    issn_nodes_select = select(metadataXpaths.issn, doc);
    if (issn_nodes_select[0] && issn_nodes_select[0].data)
        issn_nodes = issn_nodes_select[0].data;
    else
        issn_nodes = '';


    doi_nodes_select = select(metadataXpaths.doi, doc);
    if (doi_nodes_select[0] && doi_nodes_select[0].data)
        doi_nodes = doi_nodes_select[0].data;
    else
        doi_nodes = '';

    numero_nodes_select = select(metadataXpaths.numero, doc);
    if (numero_nodes_select[0] && numero_nodes_select[0].data)
        numero_nodes = numero_nodes_select[0].data;
    else
        numero_nodes = '';


    page_nodes_select = select(metadataXpaths.page, doc);
    if (page_nodes_select[0] && page_nodes_select[0].data)
        page_nodes = page_nodes_select[0].data;
    else
        page_nodes = '';

    volume_nodes_select = select(metadataXpaths.volume, doc);
    if (volume_nodes_select[0] && volume_nodes_select[0].data)
        volume_nodes = volume_nodes_select[0].data;
    else
        volume_nodes = '';

    let champs_unique = '';

    let champs_unique_init = '';

    let count = 0;

    persname_nodes.forEach(function(persname_node) {
        if (count < 3) {
            let doc_autor = new dom().parseFromString(persname_node.toString(), 'text/xml');
            let forename = select(metadataXpaths.forename, doc_autor);
            let surname = select(metadataXpaths.surname, doc_autor);
            champs_unique += '' + surname[0].firstChild + ' ' + forename[0].firstChild + ' ';
            champs_unique_init += '' + surname[0].firstChild + ' ' + forename[0].firstChild.toString().trim().charAt(0) + ' ';
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
    jsonLine.titre = { 'value': title.toString().trim() };
    jsonLine.auteur = { 'value': champs_unique.trim() };
    jsonLine.auteur_init = { 'value': champs_unique_init.trim() };
    jsonLine.doi = { 'value': doi_nodes.trim() };
    jsonLine.issn = { 'value': issn_nodes.trim() };
    jsonLine.numero = { 'value': numero_nodes.trim() };
    jsonLine.page = { 'value': page_nodes.trim() };
    jsonLine.volume = { 'value': volume_nodes.trim() };

    //console.log(jsonLine);


    return cb();

};

module.exports = business;