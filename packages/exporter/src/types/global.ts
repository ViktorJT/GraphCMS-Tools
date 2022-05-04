/* eslint-disable no-var */
import type {EnvironmentType, OptionsType} from './main.js';

export interface ExportConfigType extends EnvironmentType, OptionsType {
  concurrency: number;
  mode: {
    modelSearch: boolean;
    fieldSearch: boolean;
  };
  target: {
    environment: string;
    contentStage: string;
    locales: string[];
  };
  include: {
    includeSystemModels: boolean;
    includeSystemFields: boolean;
    includeHiddenFields: boolean;
    includeApiOnlyFields: boolean;
  };
  search: {
    models: string[];
    fields: string[];
  };
  exclude: {
    model: {
      [key: string]: boolean;
    };
    field: {
      defaults: true;
      [key: string]: boolean;
    };
    type: {
      [key: string]: boolean;
    };
    subType: {
      [key: string]: boolean;
    };
  };
}

declare global {
  var exportConfig: ExportConfigType;
}

export {};
