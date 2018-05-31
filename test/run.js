/* global __dirname, require, process, it */

'use strict';

const
  	fs = require('fs'),
    pkg = require('../package.json'),
    business = require(__dirname+'/../index.js'),
    testData = require(__dirname+'/dataset/in/test.json'),
    path = require('path'),
    chai = require('chai'),
    kuler = require('kuler'),
    expect = chai.expect;



describe(pkg.name + '/index.js', function () {
  describe('#doTheJob', function () {

    for (let i=0; i<testData.length; i++) {
      testData[i].path = path.join(__dirname, testData[i].path);
    }

    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob( testData[0], function (err) {
		  if (err) {
			  console.log(kuler(err.errCode, 'red'));
			  console.log(kuler(err.errMessage, 'red'));
			  process.exit(1);
		  }

      // console.log(testData[0]);
      expect(testData[0].author).to.be.equal('Coeurdassier Michaël Berny Philippe Couval Geoffroy');
		  expect(testData[0].title).to.be.equal('Limiting the accidental poisoning of wild and domesticated animals due to the chemical pesticides used to control water vole outbreaks: progress to date');
      expect(testData[0].titlefr).to.be.equal('Évolution des effets non intentionnels de la lutte chimique contre le campagnol terrestre sur la faune sauvage et domestique');
      expect(testData[0].issn[0]).to.be.equal('0429-2766');
		  expect(testData[0].page).to.be.equal('327-335');
		  expect(testData[0].volume).to.be.equal('1');
      expect(testData[0].issue).to.be.equal('220');
      expect(testData[0].idHal).to.be.equal('hal-01103402');
      expect(testData[0].typeConditor[0].type).to.be.equal('Article');
      expect(testData[0].orcId[0]).to.be.equal('http://orcid.org/0000-0003-2376-0136');
      expect(testData[0].source).to.be.equal('hal');
      expect(testData[0].doi).to.be.equal('test-doi');
      expect(testData[0].hasDoi).to.be.a("boolean");
      expect(testData[0].hasDoi).to.be.equal(true);
      expect(testData[0].viaf[0]).to.be.equal('test-viaf');
      expect(testData[0].typeDocument).to.be.an('array');
      expect(testData[0].typeDocument[0]).to.be.equal('ART');
      expect(testData[0].typeConditor[0].type).to.be.equal('Article');
      expect(testData[0].halAuthorId).to.be.an('array');
      expect(testData[0].titreSourceJ).to.be.equal('Fourrages');
      expect(testData[0].publicationDate).to.be.equal('2014');
        done();
      });
    });

    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob( testData[1], function (err) {
        //console.log(docObject);
        done();
      });
    });


    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob( testData[2], function (err) {
        expect(testData[2].typeConditor).to.contains({type:'Chapitre'});
        done();
      });
    });


  });
});
