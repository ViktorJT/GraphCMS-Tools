import {ModelType} from './schema.js';

export interface RequestVariablesType {
  permanentAccessToken?: string;
  projectId?: string;
  targetEnvironment?: string;
  concurrency?: number;
  includeSystemFields?: boolean;
  includeApiOnlyFields?: boolean;
  includeHiddenFields?: boolean;
}

export interface SchemaQueryResultsType {
  viewer: {
    project: {
      environment: {
        contentModel: {
          models: ModelType[];
        };
      };
    };
  };
}
