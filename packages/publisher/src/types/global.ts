/* eslint-disable no-var */
import type {OptionsType, EnvironmentType} from './index.js';

declare global {
  interface PublishConfigType extends EnvironmentType, OptionsType {
    concurrency: number;
    exclude: {
      model: {
        [key: string]: boolean;
      };
    };
  }

  var publishConfig: PublishConfigType;
}

export {};
