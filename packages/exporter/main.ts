import exportSchema from './scripts/exportSchema';
import generateQueries from './scripts/generateQueries';
import processRequests from './scripts/processRequests';

export interface OptionsType {
  concurrency: number;
  targetContentStage: string;
  targetLocales: string[] | [];
  include: {
    includeSystemModels: boolean,
    includeSystemFields: boolean,
    includeHiddenFields: boolean,
    includeApiOnlyFields: boolean,
  }
  exclude: {
    model: {
      [key: string]: boolean;
    }
    field: {
      [key: string]: boolean;
    }
    type: {
      [key: string]: boolean;
    }
    subType: {
      [key: string]: boolean;
    }
  }
}

export interface ConfigType {
  projectId: string;
  permanentAccessToken: string;
  contentApi: string;
}

export interface EnvironmentType extends ConfigType {
  targetEnvironment: string;
}

async function exportData(
  config: ConfigType,
  options: OptionsType = { // TODO Find a way to make this available globally, to avoid having to pipe it into all the scripts
    concurrency: 1,
    targetContentStage: 'DRAFT', // TODO Add default to draft instead
    targetLocales: [], // TODO
    include: {
      includeSystemModels: true,
      includeSystemFields: true, // Id fields are always exported, regardless if true or false
      includeHiddenFields: true,
      includeApiOnlyFields: true,
    },
    exclude: {
      model: {},
      field: {
        defaults: true, // ! Required
      },
      type: {},
      subType: {
        JSON: true, // TODO
      },
    }
  }) {

  const targetEnvironmentRegex: RegExp = /\w+$/g;
  const matches: RegExpExecArray | null = targetEnvironmentRegex.exec(config.contentApi);
  if (!matches || !matches.length) {
    throw new Error('Please provide a content api url containing a valid target environment');
  };

  const environment: EnvironmentType = {
    ...config,
    targetEnvironment: matches[0],
  }

  const schema = await exportSchema(environment, options);
  const queries = generateQueries(schema, options);
  const results = await processRequests(
    queries,
    environment.contentApi,
    {
      concurrency: options.concurrency,
      permanentAccessToken: environment.permanentAccessToken
    }
  );

  return results;
}

if (!process.env.GRAPHCMS_PROJECT_ID) throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN) throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_CONTENT_API) throw new Error('Please provide a valid content api url')

exportData({
  contentApi: process.env.GRAPHCMS_CONTENT_API,
  projectId: process.env.GRAPHCMS_PROJECT_ID,
  permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
})


export default exportData;
