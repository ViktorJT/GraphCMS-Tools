import testData from './testData.json' assert {type: 'json'};

import {exportData} from '@graphcms-tools/exporter';
import {importData} from '@graphcms-tools/importer';
import {writeFileSync} from 'fs';
import 'dotenv/config';

const exportTest = async () => {
  const results = await exportData({
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  });
  writeFileSync('./exportData.json', JSON.stringify(results, null, 2));
};

const importTest = async () => {
  const results = await importData(testData, {
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  });

  writeFileSync('results.json', JSON.stringify(results, null, 2));
};

// exportTest();
importTest();
