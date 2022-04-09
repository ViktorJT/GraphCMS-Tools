import exportSchema from './scripts/exportSchema';
import generateQueries from './scripts/generateQueries';
import processRequests from './scripts/processRequests';
async function exportData(config, options = {
    concurrency: 1,
    targetContentStage: 'DRAFT',
    targetLocales: [],
    include: {
        includeSystemModels: true,
        includeSystemFields: true,
        includeHiddenFields: true,
        includeApiOnlyFields: true,
    },
    exclude: {
        model: {},
        field: {
            defaults: true,
        },
        type: {},
        subType: {
            JSON: true,
        },
    },
}) {
    const targetEnvironmentRegex = /\w+$/g;
    const matches = targetEnvironmentRegex.exec(config.contentApi);
    if (!matches || !matches.length) {
        throw new Error('Please provide a content api url containing a valid target environment');
    }
    const environment = {
        ...config,
        targetEnvironment: matches[0],
    };
    const schema = await exportSchema(environment, options);
    const queries = generateQueries(schema, options);
    const results = await processRequests(queries, environment.contentApi, {
        concurrency: options.concurrency,
        permanentAccessToken: environment.permanentAccessToken,
    });
    return results;
}
if (!process.env.GRAPHCMS_PROJECT_ID)
    throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN)
    throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_CONTENT_API)
    throw new Error('Please provide a valid content api url');
exportData({
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
});
export default exportData;
