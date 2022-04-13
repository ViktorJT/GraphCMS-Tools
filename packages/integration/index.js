import {exportData} from '@graphcms-tools/exporter';
import 'dotenv/config';

console.log(
  'test',
  exportData({
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  })
);
