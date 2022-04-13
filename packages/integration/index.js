import {exportData} from '@graphcms-tools/exporter';
import {writeFileSync} from 'fs';
import 'dotenv/config';

const test = async () => {
  const results = await exportData({
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  });

  writeFileSync('results.json', JSON.stringify(results, null, 2));
};

test();
