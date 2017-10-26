/* global __dirname, require, process, it */

"use strict";

const
  	fs = require('fs'),
    pkg = require('../package.json'),
    business = require(__dirname+'/../index.js'),
    testData = require(__dirname+'/dataset/in/test.json'),
    path = require('path'),
    chai = require('chai'),
    expect = chai.expect;



describe(pkg.name + '/index.js', function () {
  describe('#doTheJob', function () {
    
    let docObject=testData[0];
    docObject.path = path.join(__dirname, docObject.path);
    

    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob( docObject, function (err) {
		  if (err) {
			  console.log(kuler(err.errCode, 'red'));
			  console.log(kuler(err.errMessage, 'red'));
			  process.exit(1);
		  }

      //console.log(docObject);
      expect(docObject.auteur.value).to.be.equal('Coeurdassier Michaël Berny Philippe Couval Geoffroy');
		  expect(docObject.titre.value).to.be.equal('Limiting the accidental poisoning of wild and domesticated animals due to the chemical pesticides used to control water vole outbreaks: progress to date');
      expect(docObject.titrefr.value).to.be.equal('Évolution des effets non intentionnels de la lutte chimique contre le campagnol terrestre sur la faune sauvage et domestique');
      expect(docObject.issn.value).to.be.equal('0429-2766');
		  expect(docObject.page.value).to.be.equal('327-335');
		  expect(docObject.volume.value).to.be.equal('1');
      expect(docObject.numero.value).to.be.equal('220');
      expect(docObject.idhal.value).to.be.equal('hal-01103402');
      expect(docObject.typeDocument.value).to.be.equal('Journal articles');
      expect(docObject.typeConditor[0].type).to.be.equal('Article');
      expect(docObject.orcid.value).to.be.equal('http://orcid.org/0000-0003-2376-0136');
      expect(docObject.source).to.be.equal('hal');
      expect(docObject.doi.value).to.be.equal('test-doi');
      expect(docObject.viaf.value).to.be.equal('test-viaf');
      expect(docObject.typeDocument.value).to.be.equal('Journal articles');
      expect(docObject.halautorid.value).to.be.an('array');
      expect(docObject.titreSource.value).to.be.equal('Fourrages');
      expect(docObject.datePubli.value).to.be.equal('2014');
       	 done();
      });
    });

    

    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob( docObject, function (err) {
        if (err) {
          console.log(kuler(err.errCode, 'red'));
          console.log(kuler(err.errMessage, 'red'));
          process.exit(1);
        }
        
        //console.log(docObject);
        expect(docObject.auteur.value).to.be.not.equal('');
        expect(docObject.auteur.value).to.be.not.undefined;
        expect(docObject.titre.value).to.be.not.equal('');
        expect(docObject.titre.value).to.be.not.undefined;
        expect(docObject.issn.value).to.be.not.equal('');
        expect(docObject.issn.value).to.be.not.undefined;
        expect(docObject.page.value).to.be.not.equal('');
        expect(docObject.page.value).to.be.not.undefined;
        expect(docObject.volume.value).to.be.not.equal('');
        expect(docObject.volume.value).to.be.not.undefined;
        expect(docObject.numero.value).to.be.not.equal('');
        expect(docObject.numero.value).to.be.not.undefined;

        done();
      });
    });
  });
});
