import ora from 'ora';
import setGlobalConfig from './scripts/setGlobalConfig.js';
import processRequests from './scripts/processRequests.js';
import generateQueries from './scripts/generateQueries.js';
import schemaQuery from './queries/schemaQuery.js';
export async function exportData(environment, options = {
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
        field: {
            defaults: true, // ! Required
        },
        subType: {
            JSON: true, // TODO
        },
    },
}) {
    setGlobalConfig(environment, options);
    const schemaSpinner = ora({ text: 'Exporting schema…', spinner: 'clock' }).start();
    const schemaQueryResults = await processRequests(schemaSpinner, [schemaQuery], 'https://management-next.graphcms.com/graphql', {
        projectId: global.config.projectId,
        targetEnvironment: global.config.targetEnvironment,
        includeSystemFields: global.config.include.includeSystemFields,
        includeApiOnlyFields: global.config.include.includeApiOnlyFields,
        includeHiddenFields: global.config.include.includeHiddenFields,
    });
    if (schemaQueryResults.length === 0) {
        schemaSpinner.fail('Exporting schema failed');
        throw Error('Something went wrong!');
    }
    else {
        schemaSpinner.succeed('Successfully exported schema');
    }
    const modelSchema = schemaQueryResults[0].viewer.project.environment.contentModel.models;
    const queries = generateQueries(modelSchema);
    const exportSpinner = ora({ text: 'Exporting content – 0%', spinner: 'clock' }).start();
    const results = await processRequests(exportSpinner, queries, global.config.contentApi);
    if (results.length === 0) {
        exportSpinner.fail('Exporting content failed');
        throw Error('Something went wrong!');
    }
    else {
        exportSpinner.succeed('Successfully exported content');
        return results;
    }
}
export default exportData;
