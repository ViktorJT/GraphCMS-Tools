import {ModelType} from './schema';

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

export interface RequestResultsType {
  fulfilled: SchemaQueryResultsType[];
  rejected: PromiseSettledResult<unknown>[];
}

export interface RequestVariablesType {
  permanentAccessToken?: string;
  projectId?: string;
  targetEnvironment?: string;
  concurrency?: number;
  includeSystemFields?: boolean;
  includeApiOnlyFields?: boolean;
  includeHiddenFields?: boolean;
}
