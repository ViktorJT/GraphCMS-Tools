import type {OptionsType, EnvironmentType} from '../types/index.js';

export const setGlobalConfig = (environment: EnvironmentType, options: OptionsType) => {
  const targetEnvironment = /\w+$/g.exec(environment.contentApi);

  if (!targetEnvironment || !targetEnvironment[0]) {
    throw Error(
      'No environment found. Provide a content api url containing a valid target environment'
    );
  }

  global.publishConfig = {
    ...environment,

    concurrency: options?.concurrency || 1,
    target: {
      environment: targetEnvironment[0],
    },
    exclude: {
      model: {
        ...options?.exclude?.model,
      },
    },
  };

  Object.freeze(global.publishConfig);
};

export default setGlobalConfig;
