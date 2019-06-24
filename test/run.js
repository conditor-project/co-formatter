/* global __dirname, require, process, it */
/* eslint-env mocha */

'use strict';

const pkg = require('../package.json');
const path = require('path');
const business = require(path.resolve('./index.js'));
const testData = require(path.resolve('./test/dataset/in/test.json'));
const chai = require('chai');
const expect = chai.expect;

describe(pkg.name + '/index.js', function () {
  describe('#doTheJob', function () {
    testData.map(testPart => {
      testPart.path = path.join(__dirname, testPart.path);
      return testPart;
    }).map(testPart => {
      it(`should extract data for ${path.basename(testPart.path)}`, function (done) {
        business.doTheJob(testPart, function (err) {
          if (err) {
            if (testPart.id !== '2') done(err);
            expect(err).to.be.an('object');
            expect(err.errMessage).to.equal('erreur d\'identification. Pas d\'id source.');
            return done();
          }

          expect(testPart.title.default).to.be.a('string');
          expect(testPart.title.default.length).to.be.gt(2);
          expect(testPart.authorNames).to.be.a('string');
          expect(testPart.authorNames.length).to.be.gt(2);
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
            expect(testPart.sourceUid).to.be.equal('hal$hal-01103402');
          }
          if (testPart.id === '3') {
            expect(testPart.typeConditor).to.be.a('string');
            expect(testPart.typeConditor).to.be.equal('Chapitre');
          }
          if (testPart.id === '4') {
            expect(testPart.pmId).to.be.equal('29681672');
            expect(testPart.hasDoi).to.be.equal(true);
            expect(testPart.title.default.indexOf('Are Differences in Disability-Free Life Expectancy')).to.be.equal(0);
            expect(testPart.publicationDate.indexOf('2014')).to.be.equal(0);
            expect(testPart.typeConditor).to.be.equal('Article');
            expect(testPart.sourceId).to.be.equal('29681672');
            expect(testPart.sourceUid).to.be.equal('pubmed$29681672');
          }
          if (testPart.id === '5') {
            expect(testPart.authors[0].affiliations).to.be.an('Array');
            expect(testPart.sourceUid).to.be.equal('hal$hal-00176937');
            expect(testPart.authors[0].affiliations[0].address).to.contains('Department of Chemistry and Fujian Provincial Key Laboratory of Chemical Biology');
          }
          if (testPart.id === '6') {
            expect(testPart.authors[0].affiliations).to.be.an('Array');
            expect(testPart.authors[0].affiliations[0].address).to.be.an('String');
            expect(testPart.authors[0].affiliations[0].address).to.contains('Gjøvik University College');
            expect(testPart.authors[0].affiliations[1].ref).to.equal('earth');
            expect(testPart.authors[0].affiliations[1].address).to.equal('wonderfull world');
          } else if (testPart.id === '7') {
            expect(testPart.pmId).to.be.equal('23554029');
            expect(testPart.sourceId).to.be.equal('23554029');
            expect(testPart.sourceUid).to.be.equal('pubmed$23554029');
            expect(testPart.xPublicationDate).to.be.an('array');
            expect(testPart.xPublicationDate.length).to.be.equal(2);
            expect(testPart.xissn).to.be.an('array');
            expect(testPart.xissn.length).to.be.equal(2);
            
          } else if (testPart.id === '8') {
            expect(testPart.sourceUid).to.be.equal('hal$hal-00952427');
            expect(testPart.authors.length).to.equal(2);
            expect(testPart.authors[0].isni[0]).to.equal('isni-mudry');
            expect(testPart.authors[0].idRef[0]).to.equal('idRef-mudry');
            expect(testPart.authors[0].idRef[0]).to.equal('idRef-mudry');
            expect(testPart.authors[0].affiliations[0].isni[0]).to.equal('0000000122597504');
            expect(testPart.authors[0].affiliations[0].isni[1]).to.equal('0000 0001 2188 3779');
            expect(testPart.authors[0].affiliations[0].idRef[0]).to.equal('166212377');
            expect(testPart.authors[0].affiliations[0].idRef[3]).to.equal('026403188');
            expect(testPart.authors[0].affiliations[0].address).to.equal('Université Bourgogne Franche-Comté [COMUE] UBFC, UMR6249, Centre National de la Recherche Scientifique CNRS, Université de Franche-Comté UFC, Laboratoire Chrono-environnement - UFC (UMR 6249) LCE, UFR Sciences et Techniques - 16, route de Gray - 25030 Besançon Cedex, FR');
            expect(testPart.authors[0].affiliations[0].ref).to.equal('struct-57629');
            expect(testPart.authors[0].affiliations[0].rnsr[0]).to.equal('200812285Y');
            expect(testPart.authors[1].isni[0]).to.equal('albisni');
            expect(testPart.authors[1].idRef[0]).to.equal('albidéref');
            expect(testPart.authors[0].affiliations[0].isni[0]).to.equal('0000000122597504');
            expect(testPart.isni).to.be.an('Array');
            expect(testPart.isni[1]).to.be.equal('albisni');
            expect(testPart.rnsr.length).to.be.equal(3);
            expect(testPart.rnsr[2]).to.be.equal('654321');
            expect(testPart.publicationDate).to.be.equal('2014-02-19');
            expect(testPart.electronicPublicationDate).to.be.equal('2014-01-17');
            expect(testPart.typeConditor).to.be.equal('Autre');
          }
          done();
        });
      });
    });

    it('docObject qui doit passer en erreur', function (done) {
      business.doTheJob(testData[1], function (err) {
        expect(err).to.be.an('object');
        expect(err.errMessage).to.equal('erreur d\'identification. Pas d\'id source.');
        done();
      });
    });
  });
});
