/* eslint-disable no-var */
import type {EnvironmentType, PreferencesType} from './main.js';

export interface ConfigType extends EnvironmentType, PreferencesType {
  concurrency: number;
  mode: {
    isSearching: boolean;
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
      defaults: boolean;
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
  var config: ConfigType;
}

export {};
