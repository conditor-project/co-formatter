/* eslint-env mocha */

const path = require('path');
const fs = require('fs-extra');
const business = require(path.resolve('./index.js'));
const testData = require(path.resolve('./test/dataset/in/test.json'));

const configPkg = require('co-config/package.json');
console.log(`Using co-config, version ${configPkg.version}`);

const outputDir = path.join(__dirname, 'dataset/out');
if (fs.existsSync(outputDir)) {
  console.warn('The output directory already exists, wipping it...');
  fs.emptyDirSync(outputDir);
}

testData.map(testPart => {
  testPart.metadata[0].path = path.join(__dirname, testPart.metadata[0].path);
  return testPart;
}).map(testPart => {
  return business.doTheJob(testPart, function (err) {
    const idToIgnore = ['2', '3', '5', '8'];
    if (err) {
      if (!idToIgnore.includes(testPart.id)) {
        console.error(`Error while processing ${testPart.metadata[0].path}:`);
        console.error(err);
      }
    } else {
      const filename = path.basename(testPart.metadata[0].path);
      const outputPath = path.join(outputDir, `${filename}.json`);
      fs.outputJsonSync(outputPath, testPart, { spaces: 2 });
      console.log(`${outputPath} succesfully generated`);
    }
  });
});
