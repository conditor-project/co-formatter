const path = require('path');
const fs = require('fs-extra');
const business = require('../index');
const testData = require('./dataset/in/docObjects');

const coConfigPath = process.env.CO_CONF ? process.env.CO_CONF : 'co-config';
const configPkg = require(`${coConfigPath}/package.json`);
console.log(`Using co-config, version ${configPkg.version}`);

(async function () {
  const outputDir = path.join(__dirname, 'dataset', 'out');
  if (fs.existsSync(outputDir)) {
    console.warn('The output directory already exists, wipping it...');
    await fs.emptyDir(outputDir);
  }

  for (const key in testData) {
    const docObject = testData[key];
    business.doTheJob(docObject, err => {
      if (err) return;

      const filename = path.basename(docObject.metadata[0].path);
      const outputPath = path.join(outputDir, `${filename}.json`);
      fs.outputJson(outputPath, docObject, { spaces: 2 })
        .then(() => console.info(`${outputPath} successfully generated`));
    });
  }
})();
