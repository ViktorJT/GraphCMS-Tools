import type {OptionsType, EnvironmentType, MetadataType} from '../types/index.js';

export const setGlobalConfig = (
  environment: EnvironmentType,
  options: OptionsType,
  metadata: MetadataType
) => {
  const targetEnvironment = /\w+$/g.exec(environment.contentApi);

  if (!targetEnvironment || !targetEnvironment[0]) {
    throw Error(
      'No environment found. Provide a content api url containing a valid target environment'
    );
  }

  global.importConfig = {
    ...environment,
    ...metadata,
    concurrency: options?.concurrency || 3,
    exclude: {
      model: {
        User: true, // ! Required
        ...options?.exclude?.model,
      },
      field: {
        createdBy: true, // ! Required
        updatedBy: true, // ! Required
        ...options?.exclude?.field,
      },
    },
  };

  Object.freeze(global.importConfig);
};

export default setGlobalConfig;
