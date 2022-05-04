import type {PreferencesType, EnvironmentType} from '../types/index.js';

export const setGlobalConfig = (environment: EnvironmentType, preferences: PreferencesType) => {
  const targetEnvironment = /\w+$/g.exec(environment.contentApi);

  if (!targetEnvironment || !targetEnvironment[0]) {
    throw Error(
      'No environment found. Provide a content api url containing a valid target environment'
    );
  }

  global.config = {
    ...environment,

    mode: {
      modelSearch: !!preferences?.search?.models?.length,
      fieldSearch: !!preferences?.search?.fields?.length,
    },

    concurrency: preferences?.concurrency || 1,
    search: {
      models: [],
      fields: [],
      ...preferences?.search,
    },
    target: {
      environment: targetEnvironment[0],
      contentStage: 'DRAFT',
      locales: [],
      ...preferences?.target,
    },
    include: {
      includeSystemModels: true,
      includeSystemFields: true,
      includeHiddenFields: true,
      includeApiOnlyFields: true,
      ...preferences?.include,
    },
    exclude: {
      model: {
        ...preferences?.exclude?.model,
      },
      field: {
        defaults: true,
        ...preferences?.exclude?.field,
      },
      type: {
        ...preferences?.exclude?.type,
      },
      subType: {
        JSON: true,
        ...preferences?.exclude?.subType,
      },
    },
  };

  Object.freeze(global.config);
};

export default setGlobalConfig;
