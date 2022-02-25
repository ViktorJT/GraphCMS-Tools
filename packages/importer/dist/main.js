import testData from '../data/test.json';
import generateConfig from './scripts/generateConfig';
import generateContentMutations from './scripts/generateContentMutations';
import generatePublishMutations from './scripts/generatePublishMutations';
import processRequests from './scripts/processRequests';
async function importData(data, environment, options = {
    concurrency: 1,
    newLocales: ['et', 'hr', 'lt', 'lv', 'ru', 'sk', 'sl', 'sr'],
    targetStages: ['QA', 'PUBLISHED'],
    mode: 'upsert',
    exclude: {
        model: {
            User: true,
        },
        field: {
            createdBy: true,
            updatedBy: true,
        },
    },
}) {
    global.config = await generateConfig(environment, options);
    Object.freeze(global.config);
    const contentMutations = generateContentMutations(data);
    const contentResults = await processRequests(contentMutations, global.config.environment.contentApi);
    if (!contentResults)
        throw new Error('Something went wrong');
    const publishMutations = generatePublishMutations(contentResults.fulfilled);
    const results = await processRequests(publishMutations, environment.contentApi);
    return results;
}
importData(testData, {
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
});
export default importData;
