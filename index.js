/* global module */
/*jslint node: true */
/*jslint indent: 2 */
'use strict';

const business = {},
		dom = require('xmldom').DOMParser,
		fs = require('fs'),
		xpath = require('xpath');


business.doTheJob = function (jsonLine, cb) {


	//console.log(jsonLine.path);

	let xml = fs.readFileSync(jsonLine.path,'utf8');
	let doc = new dom().parseFromString(xml,'text/xml');
	let select = xpath.useNamespaces({'xmlns':'http://www.tei-c.org/ns/1.0','xmlns:hal':'http://hal.archives-ouvertes.fr/'});

	let title = select('//*[local-name(.)="body"]//*[local-name(.)="biblFull"]/*[local-name(.)="titleStmt"]//*[local-name(.)="title"]/text()',doc);

	let persname_nodes = select('//*[local-name(.)="body"]//*[local-name(.)="biblFull"]//*[local-name(.)="titleStmt"]/*[local-name(.)="author" and @role="aut"]/*[local-name(.)="persName"]',doc);

	let issn_nodes = select('//*[local-name(.)="body"]//*[local-name(.)="biblFull"]//*[local-name(.)="idno" and @type="issn"]/text()',doc)[0].data;

	let doi_nodes = select('//*[local-name(.)="body"]//*[local-name(.)="biblFull"]//*[local-name(.)="idno" and @type="doi"]/text()',doc)[0].data;

	let numero_nodes = select ('//*[local-name(.)="body"]//*[local-name(.)="biblScope" and @unit="issue"]/text()',doc)[0].data;

	let page_nodes = select ('//*[local-name(.)="body"]//*[local-name(.)="biblScope" and @unit="pp"]/text()',doc)[0].data;

	let volume_nodes = select ('//*[local-name(.)="body"]//*[local-name(.)="biblScope" and @unit="volume"]/text()',doc)[0].data;

	let champs_unique='';

	let champs_unique_init='';
	
	let count=0;
	
	persname_nodes.forEach(function(persname_node){
		if (count<3) {
			let doc_autor = new dom().parseFromString(persname_node.toString(), 'text/xml');
			let forename = select('//*[local-name(.)="forename"]', doc_autor);
			let surname = select('//*[local-name(.)="surname"]', doc_autor);
			champs_unique += '' + forename[0].firstChild + ' ' + surname[0].firstChild + ' ';
			champs_unique_init += '' +forename[0].firstChild.toString().trim().charAt(0)+ ' '+surname[0].firstChild + ' ';
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
	jsonLine.titre={'value':title.toString().trim()};
	jsonLine.auteur={'value':champs_unique.trim()};
	jsonLine.auteur_init={'value':champs_unique_init.trim()};
	jsonLine.doi={'value':doi_nodes.trim()};
	jsonLine.issn={'value':issn_nodes.trim()};
	jsonLine.numero={'value':numero_nodes.trim()};
	jsonLine.page={'value':page_nodes.trim()};
	jsonLine.volume={'value':volume_nodes.trim()};

	console.log(jsonLine);


	return cb();

};

business.finalJob = function (docObjects, cb) {
    let err = [];
    err.push(docObjects.pop());
    docObjects[0].ending = 'finalJob';
    return cb(err);
};

module.exports = business;