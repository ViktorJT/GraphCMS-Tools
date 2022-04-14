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

  global.config = {
    targetEnvironment: targetEnvironment[0],
    ...environment,
    ...metadata,
    ...options,
  };

  Object.freeze(global.config);
};

export default setGlobalConfig;
