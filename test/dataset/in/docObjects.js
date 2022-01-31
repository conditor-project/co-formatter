const path = require('path');

const emptyXml = {
  id: '1',
  metadata: [
    {
      path: path.join(__dirname, 'empty.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'hal',
};

const xmlWithSyntaxError = {
  id: '2',
  metadata: [
    {
      path: path.join(__dirname, 'syntax-error.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'hal',
};

const inexistantXml = {
  id: '3',
  metadata: [
    {
      path: path.join(__dirname, 'inexistant.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'hal',
};

const halWithUnknownType = {
  id: '6',
  metadata: [
    {
      path: path.join(__dirname, 'hal-unknown-type.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'hal',
};

const noSourceId = {
  id: '8',
  metadata: [
    {
      path: path.join(__dirname, 'no-source-id.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'wos',
};

const hal1 = {
  id: '4',
  source: 'hal',
  metadata: [
    {
      path: path.join(__dirname, 'hal1.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
};

const hal2 = {
  id: '5',
  metadata: [
    {
      path: path.join(__dirname, 'hal2.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'hal',
};

const pubmed1 = {
  id: '9',
  metadata: [
    {
      path: path.join(__dirname, 'pubmed1.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'pubmed',
};

const pubmed2 = {
  id: '10',
  metadata: [
    {
      path: path.join(__dirname, 'pubmed2.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'pubmed',
};

const sudoc1 = {
  id: '11',
  metadata: [
    {
      path: path.join(__dirname, 'sudoc1.xml'),
      mime: 'application/tei+xml',
      original: false,
    },
  ],
  source: 'sudoc-theses',
};

module.exports = {
  emptyXml,
  xmlWithSyntaxError,
  inexistantXml,
  halWithUnknownType,
  noSourceId,
  hal1,
  hal2,
  pubmed1,
  pubmed2,
  sudoc1,
};
