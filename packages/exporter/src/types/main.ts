export interface OptionsType {
  concurrency?: number;
  target?: {
    contentStage?: string;
    locales?: string[];
  };
  include?: {
    includeSystemModels?: boolean;
    includeSystemFields?: boolean;
    includeHiddenFields?: boolean;
    includeApiOnlyFields?: boolean;
  };
  search?: {
    models?: string[];
    fields?: string[];
  };
  exclude?: {
    model?: {
      [key: string]: boolean;
    };
    field?: {
      [key: string]: boolean;
    };
    type?: {
      [key: string]: boolean;
    };
    subType?: {
      [key: string]: boolean;
    };
  };
}

export interface EnvironmentType {
  projectId: string;
  permanentAccessToken: string;
  contentApi: string;
}
