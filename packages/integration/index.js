import {exportData} from '@graphcms-tools/exporter';

console.log(
  'test',
  exportData({
    contentApi: GRAPHCMS_CONTENT_API,
    projectId: GRAPHCMS_PROJECT_ID,
    permanentAccessToken: GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  })
);
