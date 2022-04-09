export interface OptionsType {
  concurrency: number;
  targetContentStage: string;
  targetLocales: string[];
  include: {
    includeSystemModels: boolean;
    includeSystemFields: boolean;
    includeHiddenFields: boolean;
    includeApiOnlyFields: boolean;
  };
  exclude: {
    model?: {
      [key: string]: boolean;
    };
    field: {
      defaults: boolean;
      [key: string]: boolean;
    };
    type?: {
      [key: string]: boolean;
    };
    subType: {
      [key: string]: boolean;
    };
  };
}

export interface EnvironmentType {
  projectId: string;
  permanentAccessToken: string;
  contentApi: string;
}
