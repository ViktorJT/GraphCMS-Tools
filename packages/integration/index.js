import {exportData} from '@graphcms-tools/exporter';
import {importData} from '@graphcms-tools/importer';
import {publishData} from '@graphcms-tools/publisher';
import {writeFileSync} from 'fs';
import 'dotenv/config';

// const exportTest = async () => {
//   const results = await exportData({
//     contentApi: process.env.GRAPHCMS_CONTENT_API,
//     projectId: process.env.GRAPHCMS_PROJECT_ID,
//     permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
//   });
//   writeFileSync('./exportData.json', JSON.stringify(results, null, 2));
// };

// const importTest = async () => {
//   const results = await importData(testData, {
//     contentApi: process.env.GRAPHCMS_CONTENT_API,
//     projectId: process.env.GRAPHCMS_PROJECT_ID,
//     permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
//   });

//   writeFileSync('results.json', JSON.stringify(results, null, 2));
// };

// const publishTest = async () => {
//   const results = await publishData(testData, {
//     contentApi: process.env.GRAPHCMS_CONTENT_API,
//     projectId: process.env.GRAPHCMS_PROJECT_ID,
//     permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
//   });

//   writeFileSync('results.json', JSON.stringify(results, null, 2));
// };

const megaTest = async () => {
  const content = await exportData({
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  });
  writeFileSync('./exportData.json', JSON.stringify(content, null, 2));

  const [imported, rejected] = await importData(content, {
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  });
  writeFileSync('./importData.json', JSON.stringify([imported, rejected], null, 2));

  const [published, unpublished] = await publishData(imported, {
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  });
  writeFileSync('./publishData.json', JSON.stringify([published, unpublished], null, 2));
};

megaTest();
