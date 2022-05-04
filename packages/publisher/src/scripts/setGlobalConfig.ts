import type {OptionsType, EnvironmentType} from '../types/index.js';

export const setGlobalConfig = (environment: EnvironmentType, options: OptionsType) => {
  global.publishConfig = {
    ...environment,
    concurrency: options?.concurrency || 1,
    exclude: {
      model: {
        ...options?.exclude?.model,
      },
    },
  };

  Object.freeze(global.publishConfig);
};

export default setGlobalConfig;
