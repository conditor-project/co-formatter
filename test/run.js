/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const business = require('../index');
const testData = require('./dataset/in/docObjects');
const { expect } = require('chai');

const coConfigPath = process.env.CO_CONF ? process.env.CO_CONF : 'co-config';
const configPkg = require(`${coConfigPath}/package.json`);
console.log(`Using co-config, version ${configPkg.version}`);

describe('#doTheJob', () => {
  it('testData.emptyXml has no source id', done => {
    const docObject = testData.emptyXml;
    business.doTheJob(docObject, err => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.equal('NoSourceIdError');
      done();
    });
  });

  it('testData.xmlWithSyntaxError has a syntax error', done => {
    const docObject = testData.xmlWithSyntaxError;
    business.doTheJob(docObject, err => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.be.equal('XmlParsingError');
      done();
    });
  });

  it('testData.inexistantXml has an inexistant XML', done => {
    const docObject = testData.inexistantXml;
    business.doTheJob(docObject, err => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.be.equal('FileNotFoundError');
      done();
    });
  });

  it('testData.halWithUnknownType has no Conditor type', done => {
    const docObject = testData.halWithUnknownType;
    business.doTheJob(docObject, err => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.equal('NoConditorTypeError');
      done();
    });
  });

  it('testData.noSourceId has no source id', done => {
    const docObject = testData.noSourceId;
    business.doTheJob(docObject, err => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.equal('NoSourceIdError');
      done();
    });
  });

  it('Data successfully extracted from testData.hal1', done => {
    const docObject = testData.hal1;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.first3AuthorNames).to.be.equal('Coeurdassier Michaël Berny Philippe Couval Geoffroy');
      expect(docObject.first3AuthorNamesWithInitials).to.be.equal('Coeurdassier M Berny P Couval G');
      expect(docObject.authorNames).to.be.equal('Coeurdassier Michaël Berny Philippe Couval Geoffroy Decors Anouk Jacquot Manon Queffélec S Quintaine Thomas Giraudoux Patrick');
      expect(docObject.title.default).to.be.equal('Limiting the accidental poisoning of wild and domesticated animals due to the chemical pesticides used to control water vole outbreaks: progress to date');
      expect(docObject.title.fr).to.be.equal('Évolution des effets non intentionnels de la lutte chimique contre le campagnol terrestre sur la faune sauvage et domestique');
      expect(docObject.host.issn[0]).to.be.equal('0429-2766');
      expect(docObject.host.pages.range).to.be.equal('327-335');
      expect(docObject.host.volume).to.be.equal('1');
      expect(docObject.host.issue).to.be.equal('220');
      expect(docObject.halId).to.be.equal('hal-01103402');
      expect(docObject.authors[7].idHal).to.be.equal('2179');
      expect(docObject.authors[7].halAuthorId).to.contains('828346');
      expect(docObject._business.duplicateGenre).to.be.equal('Article');
      expect(docObject.authors[7].orcId[0]).to.be.equal('http://orcid.org/0000-0003-2376-0136');
      expect(docObject.source).to.be.equal('hal');
      expect(docObject.doi).to.be.equal('test-doi');
      expect(docObject._business.hasDoi).to.be.equal(true);
      expect(docObject.authors[7].viaf[0]).to.be.equal('test-viaf');
      expect(docObject.originalGenre[0]).to.be.equal('ART');
      expect(docObject._business.duplicateGenre).to.be.equal('Article');
      expect(docObject.host.title).to.be.equal('Fourrages');
      expect(docObject.host.publicationDate).to.be.equal('2014');
      expect(docObject.sourceId).to.be.equal('hal-01103402');
      expect(docObject.sourceUid).to.be.equal('hal$hal-01103402');
      done();
    });
  });

  it('Data successfully extracted from testData.hal2', done => {
    const docObject = testData.hal2;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.authors[0].affiliations).to.be.an('Array');
      expect(docObject.authors[0].affiliations[0].address).to.be.an('String');
      expect(docObject.authors[0].affiliations[0].address).to.contains('Gjøvik University College');
      expect(docObject.authors[0].affiliations[1].ref).to.equal('earth');
      expect(docObject.authors[0].affiliations[1].address).to.equal('wonderfull world');
      done();
    });
  });

  it('Data successfully extracted from testData.pubmed1', done => {
    const docObject = testData.pubmed1;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.pmId).to.be.equal('29681672');
      expect(docObject._business.hasDoi).to.be.equal(true);
      expect(docObject.title.default.indexOf('Are Differences in Disability-Free Life Expectancy')).to.be.equal(0);
      expect(docObject.host.publicationDate).to.be.equal('2014-06-01');
      expect(docObject._business.duplicateGenre).to.be.equal('Article');
      expect(docObject.sourceId).to.be.equal('29681672');
      expect(docObject.sourceUid).to.be.equal('pubmed$29681672');
      done();
    });
  });

  it('Data successfully extracted from testData.pubmed2', done => {
    const docObject = testData.pubmed2;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.pmId).to.be.equal('23554029');
      expect(docObject.sourceId).to.be.equal('23554029');
      expect(docObject.sourceUid).to.be.equal('pubmed$23554029');
      expect(docObject._business.xPublicationDate.length).to.be.equal(2);
      expect(docObject._business.xissn.length).to.be.equal(2);
      expect(docObject.title.default).to.not.contains('My custom subtitle');
      done();
    });
  });

  it('Data successfully extracted from testData.sudoc1', done => {
    const docObject = testData.sudoc1;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.title.default).to.be.equal('Les freins à la collaboration entre le médecin généraliste et le service de protection maternelle et infantile : Etude qualitative réalisée dans le Haut-Rhin');
      expect(docObject.host.editor[0].fullname).to.be.equal('Marie-Josée Kubler-Leveque');
      expect(docObject.host.editor[0].idRef[0]).to.be.equal('084708050');
      expect(docObject.host.editor[0].roles).to.be.equal('thesisAdvisor');
      expect(docObject.host.editor[0].orgName).to.be.empty;
      expect(docObject.host.editor[1].fullname).to.be.empty;
      expect(docObject.host.editor[1].idRef[0]).to.be.equal('173113206');
      expect(docObject.host.editor[1].roles).to.be.equal('degreeGrantor');
      expect(docObject.host.editor[1].orgName).to.be.equal('Université de Strasbourg');
      done();
    });
  });
});
