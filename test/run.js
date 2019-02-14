/* global __dirname, require, process, it */
/* eslint-env mocha */

'use strict';

const pkg = require('../package.json');
const path = require('path');
const business = require(path.resolve('./index.js'));
const testData = require(path.resolve('./test/dataset/in/test.json'));
const chai = require('chai');
const kuler = require('kuler');
const expect = chai.expect;

describe(pkg.name + '/index.js', function () {
  describe('#doTheJob', function () {
    for (let i = 0; i < testData.length; i++) {
      testData[i].path = path.join(__dirname, testData[i].path);
    }

    it('docObject qui renvoie canvasOK @1', function (done) {
      for (const testPart of testData) {
        business.doTheJob(testPart, function (err) {
          if (testPart.id === '2') {
            expect(err.errCode).to.be.not.equal(0);
          } else if (err) {
            console.log(kuler(err.errCode, 'red'));
            console.log(kuler(err.errMessage, 'red'));
            console.log(kuler('doc object testé d\id '+testPart.id, 'red'));
            process.exit(1);
          } else {
            expect(testPart.title.default).to.be.a('string');
            expect(testPart.title.default.length).to.be.gt(2);
            expect(testPart.authorNames).to.be.a('string');
            expect(testPart.authorNames.length).to.be.gt(2);  
          }
          
          if (testPart.id === '1') {
            expect(testPart.first3AuthorNames).to.be.equal('Coeurdassier Michaël Berny Philippe Couval Geoffroy');
            expect(testPart.first3AuthorNamesWithInitials).to.be.equal('Coeurdassier M Berny P Couval G');
            expect(testPart.authorNames).to.be.equal('Coeurdassier Michaël Berny Philippe Couval Geoffroy Decors Anouk Jacquot Manon Queffélec S Quintaine Thomas Giraudoux Patrick');
            expect(testPart.title.default).to.be.equal('Limiting the accidental poisoning of wild and domesticated animals due to the chemical pesticides used to control water vole outbreaks: progress to date');
            expect(testPart.title.fr).to.be.equal('Évolution des effets non intentionnels de la lutte chimique contre le campagnol terrestre sur la faune sauvage et domestique');
            expect(testPart.issn[0]).to.be.equal('0429-2766');
            expect(testPart.pageRange).to.be.equal('327-335');
            expect(testPart.volume).to.be.equal('1');
            expect(testPart.issue).to.be.equal('220');
            expect(testPart.halId).to.be.equal('hal-01103402');
            expect(testPart.idHal).to.be.equal('2179');
            expect(testPart.halAuthorId).to.contains('828346');
            expect(testPart.typeConditor).to.be.equal('Article');
            expect(testPart.orcId[0]).to.be.equal('http://orcid.org/0000-0003-2376-0136');
            expect(testPart.source).to.be.equal('hal');
            expect(testPart.doi).to.be.equal('test-doi');
            expect(testPart.hasDoi).to.be.a('boolean');
            expect(testPart.hasDoi).to.be.equal(true);
            expect(testPart.viaf[0]).to.be.equal('test-viaf');
            expect(testPart.documentType).to.be.an('array');
            expect(testPart.documentType[0]).to.be.equal('ART');
            expect(testPart.typeConditor).to.be.equal('Article');
            expect(testPart.halAuthorId).to.be.an('array');
            expect(testPart.title.journal).to.be.equal('Fourrages');
            expect(testPart.publicationDate).to.be.equal('2014');   
            expect(testPart.sourceId).to.be.equal('hal-01103402');
            expect(testPart.sourceUid).to.be.equal('hal#hal-01103402');
          } else if (testPart.id === '4') {
            expect(testPart.pmId).to.be.equal('29681672');
            expect(testPart.hasDoi).to.be.equal(true);
            expect(testPart.title.default.indexOf('Are Differences in Disability-Free Life Expectancy')).to.be.equal(0);
            expect(testPart.publicationDate.indexOf('2014')).to.be.equal(0);
            expect(testPart.typeConditor).to.be.equal('Article');
            expect(testPart.sourceId).to.be.equal('29681672');
            expect(testPart.sourceUid).to.be.equal('pubmed#29681672');
          }
        });
      }
      done();
    });

    it('docObject qui doit passer en erreur', function (done) {
      business.doTheJob(testData[1], function (err) {
        expect(err).to.be.an('object');
        expect(err.errMessage).to.equal('erreur d\'identification. Pas d\'id source.');
        done();
      });
    });

    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob(testData[2], function (err) {
        if (err) return done(err);
        expect(testData[2].typeConditor).to.be.a('string');
        expect(testData[2].typeConditor).to.be.equal('Chapitre');
        done();
      });
    });
  });
});
