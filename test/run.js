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

      console.log(docObject);
      expect(docObject.auteur.value).to.be.equal('Silva Ricardo R. Jourdan Fabien Salvanha Diego M.');
		  expect(docObject.titre.value).to.be.equal('ProbMetab: an R package for Bayesian probabilistic annotation of LC-MS-based metabolomics');
		  expect(docObject.issn.value).to.be.equal('1367-4803');
		  expect(docObject.page.value).to.be.equal('1336 - 1337');
		  expect(docObject.volume.value).to.be.equal('30');
      expect(docObject.numero.value).to.be.equal('9');
      expect(docObject.source).to.be.equal('hal');
       	 done();
      });
    });

    docObject=testData[1];
    docObject.path = path.join(__dirname, docObject.path);
    

    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob( docObject, function (err) {
        if (err) {
          console.log(kuler(err.errCode, 'red'));
          console.log(kuler(err.errMessage, 'red'));
          process.exit(1);
        }
        
        console.log(docObject);
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
