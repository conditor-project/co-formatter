/* global __dirname, require, process, it */
/* eslint-env mocha */

'use strict';

const path = require('path');
const fs = require('fs-extra');
const business = require(path.resolve('./index.js'));
const testData = require(path.resolve('./test/dataset/in/test.json'));

const configPkg = require('co-config/package.json');
console.log("Using co-config, version "+configPkg.version);

const outputDir = path.join(__dirname, 'dataset/out');
if (fs.existsSync(outputDir)) {
  console.warn("Le répertoire de sortie existe déjà, on le nettoie...");
  fs.emptyDirSync(outputDir);
}

testData.map(testPart => {
  testPart.metadata[0].path = path.join(__dirname, testPart.metadata[0].path);
  return testPart;
}).map(testPart => {
  business.doTheJob(testPart, function (err) {
    const idToIgnore = ["2","3","5","8"];
    if (err) {
      if (!idToIgnore.includes(testPart.id)) {
        console.error("Erreur dans le traitement du fichier "+testPart.metadata[0].path+" :\n");
        console.error(err);
      }
    } else {
      const filename = path.basename(testPart.metadata[0].path);
      const outputPath = path.join(outputDir, filename + ".json");
      fs.outputJsonSync(outputPath, testPart, {spaces: 2});
      console.log("génération du fichier "+outputPath+" OK");
    }
  });
});
  