import generateQueries from './scripts/generateQueries';
import processRequests from './scripts/processRequests';

import type {OptionsType, EnvironmentType} from './types';

import {schemaQuery} from './queries/schemaQuery';

async function exportData(
  environment: EnvironmentType,
  options: OptionsType = {
    concurrency: 1,
    targetContentStage: 'DRAFT', // TODO Add default to draft instead
    targetLocales: [], // TODO
    include: {
      includeSystemModels: true,
      includeSystemFields: true, // Id fields are always exported
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
  }
) {
  const targetEnvironment = /\w+$/g.exec(environment.contentApi);

  if (!targetEnvironment)
    throw new Error(
      'No environment found. Provide a content api url containing a valid target environment'
    );

  global.config = {
    targetEnvironment: targetEnvironment[0],
    ...environment,
    ...options,
  };

  Object.freeze(global.config);

  const {fulfilled: schemaQueryResults, rejected} = await processRequests(
    schemaQuery,
    'https://management-next.graphcms.com/graphql',
    {
      projectId: global.config.projectId,
      targetEnvironment: global.config.targetEnvironment,
      includeSystemFields: global.config.include.includeSystemFields,
      includeApiOnlyFields: global.config.include.includeApiOnlyFields,
      includeHiddenFields: global.config.include.includeHiddenFields,
    }
  );

  if (rejected.length) console.log(`${rejected.length} requests rejected`);

  const modelSchema = schemaQueryResults[0].viewer.project.environment.contentModel.models;

  const queries = generateQueries(modelSchema);

  const results = await processRequests(queries, environment.contentApi, {
    concurrency: options.concurrency,
    permanentAccessToken: environment.permanentAccessToken,
  });

  return results;
}

export default exportData;
