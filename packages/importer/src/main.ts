import testData from './test.json'
import exportMeta, { LocaleType } from './scripts/exportMeta';
import generateContentMutations from './scripts/generateContentMutations';
import generatePublishMutations from './scripts/generatePublishMutations';
import processRequests from './scripts/processRequests';

export interface OptionsType {
  concurrency: number;
  targetStages: string[];
  newLocales: string[] | [];
  mode: string;
  exclude: {
    model: {
      [key: string]: boolean;
    }
    field: {
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

// interface DataType { // TODO
//   [key: string]: any[];
// }

async function importData(
  // data: DataType[], // TODO
  data: any,
  config: ConfigType,
  options: OptionsType = {
    concurrency: 1,
    newLocales: ['et', 'hr', 'lt', 'lv', 'ru', 'sk', 'sl', 'sr'], // TODO
    targetStages: ['QA', 'PUBLISHED'], // TODO Add validations from metadata later?
    mode: 'upsert', // TODO
    exclude: {
      model: {
        User: true, // ! Required
      },
      field: {
        createdBy: true, // ! Required
        updatedBy: true, // ! Required
      },
    },
  },
) {
  const targetEnvironmentRegex: RegExp = /\w+$/g;
  const matches: RegExpExecArray | null = targetEnvironmentRegex.exec(config.contentApi);
  if (!matches || !matches.length) {
    throw new Error('Please provide a content api url containing a valid target environment');
  }

  const environment: EnvironmentType = {
    ...config,
    targetEnvironment: matches[0],
  };

  const {allLocales, enumerations} = await exportMeta(environment, options);

  const defaultLocale = allLocales.find((locale: LocaleType): boolean => locale.isDefault);

  if (!defaultLocale) throw new Error('No default locale found'); // TODO Is there always a default locale, even if there are no other locales?

  const contentMutations = generateContentMutations(
    data,
    { defaultLocale: defaultLocale.apiId, enumerations },
    options
  );

  const contentResults = await processRequests(
    contentMutations,
    environment.contentApi,
    {
      concurrency: options.concurrency,
      permanentAccessToken: environment.permanentAccessToken,
    }
  );
  const publishMutations = generatePublishMutations(contentResults, options);

  const results = await processRequests(
    publishMutations,
    environment.contentApi,
    {
      concurrency: options.concurrency,
      permanentAccessToken: environment.permanentAccessToken,
    }
  );
  return results; // TODO Make it so all successful and REJECTED requests are returned
}

if (!process.env.GRAPHCMS_PROJECT_ID) throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN) throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_CONTENT_API) throw new Error('Please provide a valid content api url');

importData(
  testData,
  {
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  }
);

export default importData;
