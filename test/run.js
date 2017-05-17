/* global __dirname, require, process, it */

"use strict";

const
  	fs = require('fs'),
	pkg = require('../package.json'),
  	business = require('../index.js'),
	testData = require('./dataset/in/test.json'),
  	chai = require('chai'),
	expect = chai.expect;



describe(pkg.name + '/index.js', function () {
  describe('#doTheJob', function () {
	let docObject=testData[0];

    it('docObject qui renvoie canvasOK @1', function (done) {
      business.doTheJob( docObject, function (err) {
		  if (err) {
			  console.log(kuler(err.errCode, 'red'));
			  console.log(kuler(err.errMessage, 'red'));
			  process.exit(1);
		  }

		  expect(docObject.auteur.value).to.be.equal('Silva Ricardo R. Jourdan Fabien Salvanha Diego M.');
		  expect(docObject.titre.value).to.be.equal('ProbMetab: an R package for Bayesian probabilistic annotation of LC-MS-based metabolomics');
		  expect(docObject.issn.value).to.be.equal('1367-4803');
		  //expect(docObject.doi.value).to.be.equal('10.1093/bioinformatics/btu019');
		  expect(docObject.page.value).to.be.equal('1336 - 1337');
		  expect(docObject.volume.value).to.be.equal('30');
		  expect(docObject.numero.value).to.be.equal('9');
       	 done();
      });
    });
  });
});
