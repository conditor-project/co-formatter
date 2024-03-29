/* eslint-disable no-unused-expressions */
/* eslint-env mocha */

const business = require('../index');
const testData = require('./dataset/in/docObjects');
const { expect } = require('chai');
const corhalConfig = require('corhal-config/package.json');

console.log(`Using corhalConfig, version ${corhalConfig.version}`);

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
      expect(err.name).to.equal('XmlParsingError');
      done();
    });
  });

  it('testData.inexistantXml has an inexistant XML', done => {
    const docObject = testData.inexistantXml;
    business.doTheJob(docObject, err => {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.name).to.equal('FileNotFoundError');
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
      expect(docObject.business.first3AuthorNames).to.equal('Coeurdassier Michael Berny Philippe Couval Geoffroy');
      expect(docObject.business.first3AuthorNamesWithInitials).to.equal('Coeurdassier M Berny P Couval G');
      expect(docObject.title.default).to.equal('Limiting the accidental poisoning of wild and domesticated animals due to the chemical pesticides used to control water vole outbreaks: progress to date');
      expect(docObject.title.fr).to.equal('Évolution des effets non intentionnels de la lutte chimique contre le campagnol terrestre sur la faune sauvage et domestique');
      expect(docObject.host.issn).to.equal('04292766');
      expect(docObject.host.pages.range).to.equal('327-335');
      expect(docObject.business.pageRange[0]).to.equal('327-335');
      expect(docObject.host.volume).to.equal('bidon volume');
      expect(docObject.host.issue).to.equal('220');
      expect(docObject.halId).to.equal('hal-01103402');
      expect(docObject.authors[7].idHal).to.contain('2179');
      expect(docObject.authors[7].halAuthorId).to.contain('828346');
      expect(docObject.authors[7].isni).to.contain('bidon isni');
      expect(docObject.business.duplicateGenre).to.equal('Article');
      expect(docObject.authors[7].orcId[0]).to.equal('https://orcid.org/0000-0003-2376-0136');
      expect(docObject.source).to.equal('hal');
      expect(docObject.doi).to.equal('bidon doi');
      expect(docObject.business.sourceUidChain).to.equal('!hal$hal-01103402!');
      expect(docObject.business.hasDoi).to.be.true;
      expect(docObject.authors[7].viaf[0]).to.equal('bidon viaf');
      expect(docObject.originalGenre).to.equal('ART');
      expect(docObject.business.duplicateGenre).to.equal('Article');
      expect(docObject.host.title).to.equal('Fourrages');
      expect(docObject.host.publicationDate).to.equal('2014');
      expect(docObject.sourceId).to.equal('hal-01103402');
      expect(docObject.sourceUid).to.equal('hal$hal-01103402');
      expect(docObject.abstract.en.length).to.be.greaterThan(0);
      expect(docObject.abstract.fr.length).to.be.greaterThan(0);
      expect(docObject.arxiv).to.be.equal('bidon doit être extrait 1602.06857');
      expect(docObject.authors[7].idRef[0]).to.be.equal('https://www.idref.fr/059300507');
      expect(docObject.classifications.hal[0].code).to.be.equal('sdv');
      expect(docObject.classifications.hal[1].en).to.be.equal('Life Sciences [q-bio]/Ecology, environment');
      done();
    });
  });

  it('Data successfully extracted from testData.hal2', done => {
    const docObject = testData.hal2;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.authors[0].affiliations[0].ref).to.equal('struct-579890');
      expect(docObject.authors[0].affiliations[0].address).to.contain('Norwegian University of Science and Technology');
      expect(docObject.authors[1].affiliations[1].ref).to.equal('struct-22594');
      expect(docObject.authors[1].affiliations[1].address).to.contain('Université de Bourgogne UB');
      done();
    });
  });

  it('Data successfully extracted from testData.hal3', done => {
    const docObject = testData.hal3;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.title.fr).to.be.equal('La dimension pamphlétaire dans le roman francophone subsaharien postcolonial : Mongo Béti, Perpétue et l’habitude du malheur, Fatoumata Kéita, Sous fer, Ahmadou Kourouma, En attendant le vote des bêtes sauvages');
      expect(docObject.sourceId).to.equal('tel-03227836');
      expect(docObject.sourceUid).to.equal('hal$tel-03227836');
      expect(docObject.business.xPublicationDate).to.have.members(['2021-01-27']);
      expect(docObject.authors[0].surname).to.equal('Diarra');
      expect(docObject.authors[0].halAuthorId).to.have.members(['12295960']);
      done();
    });
  });

  it('Data successfully extracted from testData.halMeeting', done => {
    const docObject = testData.halMeeting;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.host.title).to.be.equal('Proceedings BigData 2018: IEEE international conference on Big Data');
      expect(docObject.title.default).to.be.equal('Detecting highly overlapping community structure by model-based maximal clique expansion');
      expect(docObject.host.conference.name).to.be.equal('BigData 2018: IEEE international conference on Big Data');
      expect(docObject.host.conference.date).to.be.equal('2018-12-10');
      expect(docObject.host.conference.place).to.be.equal('Seattle');
      expect(docObject.host.conference.country).to.be.equal('United States');
      done();
    });
  });

  it('Data successfully extracted from testData.halMonogr', done => {
    const docObject = testData.halMonogr;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.host.title).to.be.equal('Recent Trends in Computational Science and Engineering');
      expect(docObject.title.default).to.be.equal('Survey of Computational Methods for Inverse Problems');
      expect(docObject.host.isbn).to.be.equal('bidon 978-94-007-5051-7');
      expect(docObject.host.eisbn).to.be.equal('bidon 978-94-007-5052-4');
      done();
    });
  });

  it('Data successfully extracted from testData.pubmed1', done => {
    const docObject = testData.pubmed1;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.pmId).to.equal('29681672');
      expect(docObject.business.hasDoi).to.be.true;
      expect(docObject.title.default).to.contain('Are Differences in Disability-Free Life Expectancy');
      expect(docObject.host.publicationDate).to.equal('2014-06');
      expect(docObject.business.duplicateGenre).to.equal('Article');
      expect(docObject.sourceId).to.equal('29681672');
      expect(docObject.sourceUid).to.equal('pubmed$29681672');
      done();
    });
  });

  it('Data successfully extracted from testData.pubmed2', done => {
    const docObject = testData.pubmed2;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.pmId).to.equal('23554029');
      expect(docObject.sourceId).to.equal('23554029');
      expect(docObject.sourceUid).to.equal('pubmed$23554029');
      expect(docObject.host.issn).to.equal('bidon 1099-1573');
      expect(docObject.host.eissn).to.equal('1099-1573');
      expect(docObject.business.xissn).to.have.members(['bidon 1099-1573', '1099-1573']);
      expect(docObject.business.xPublicationDate).to.have.members(['2013-04-03', '2012-12-01']);
      expect(docObject.title.default).to.not.contain('My custom subtitle');
      expect(docObject.authors[5].fullname).to.equal('Maurice Cloarec');
      expect(docObject.authors[6].fullname).to.equal('French Covid-19 Paediatric Inflammation Consortium');
      for (const author of docObject.authors) {
        expect(author?.fullname).to.be.not.undefined;
        expect(author.fullname.trim()).to.not.equal('');
      }
      done();
    });
  });

  it('Data successfully extracted from testData.sudoc1', done => {
    const docObject = testData.sudoc1;
    business.doTheJob(docObject, err => {
      expect(err).to.be.undefined;
      expect(docObject.title.default).to.equal('Les freins à la collaboration entre le médecin généraliste et le service de protection maternelle et infantile : Etude qualitative réalisée dans le Haut-Rhin');
      expect(docObject.host.editors[0].fullname).to.equal('Marie-Josée Kubler-Leveque');
      expect(docObject.host.editors[0].idRef).to.equal('084708050');
      expect(docObject.host.editors[0].roles).to.equal('thesisAdvisor');
      expect(docObject.host.editors[0].orgName).to.be.undefined;
      expect(docObject.host.editors[1].fullname).to.be.undefined;
      expect(docObject.host.editors[1].idRef).to.equal('173113206');
      expect(docObject.host.editors[1].roles).to.equal('degreeGrantor');
      expect(docObject.host.editors[1].orgName).to.equal('Université de Strasbourg');
      expect(docObject.keywords.fr.author).to.have.members(['bidon Encéphalopathie épileptique précoce', 'bidon Nouveau-Né']);
      expect(docObject.keywords.fr.mesh).to.have.members(['Centres de protection maternelle et infantile']);
      expect(docObject.keywords.fr.rameau).to.have.members(['Médecins généralistes--Thèses et écrits académiques', 'Coopération médicale--Thèses et écrits académiques']);
      done();
    });
  });
});
