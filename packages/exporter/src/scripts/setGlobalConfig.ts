import type {OptionsType, EnvironmentType} from '../types/index.js';

export const setGlobalConfig = (environment: EnvironmentType, options: OptionsType) => {
  const targetEnvironment = /\w+$/g.exec(environment.contentApi);

  if (!targetEnvironment || !targetEnvironment[0]) {
    throw Error(
      'No environment found. Provide a content api url containing a valid target environment'
    );
  }

  global.exportConfig = {
    ...environment,

    mode: {
      modelSearch: !!options?.search?.models?.length,
      fieldSearch: !!options?.search?.fields?.length,
    },

    concurrency: options?.concurrency || 3,
    search: {
      models: [],
      fields: [],
      ...options?.search,
    },
    target: {
      environment: targetEnvironment[0],
      contentStage: 'DRAFT',
      locales: [],
      ...options?.target,
    },
    include: {
      includeSystemModels: true,
      includeSystemFields: true,
      includeHiddenFields: true,
      includeApiOnlyFields: true,
      ...options?.include,
    },
    exclude: {
      model: {
        ...options?.exclude?.model,
      },
      field: {
        defaults: true,
        ...options?.exclude?.field,
      },
      type: {
        ...options?.exclude?.type,
      },
      subType: {
        JSON: true,
        ...options?.exclude?.subType,
      },
    },
  };

  Object.freeze(global.exportConfig);
};

export default setGlobalConfig;
