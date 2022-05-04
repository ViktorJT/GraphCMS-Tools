/* eslint-disable no-var */
import type {OptionsType, EnvironmentType, MetadataType} from './index.js';

declare global {
  interface ImportConfigType extends EnvironmentType, OptionsType, MetadataType {
    concurrency: number;
    exclude: {
      model: {
        User: true;
        [key: string]: boolean;
      };
      field: {
        createdBy: true;
        updatedBy: true;
        [key: string]: boolean;
      };
    };
  }

  var importConfig: ImportConfigType;
}

export {};
