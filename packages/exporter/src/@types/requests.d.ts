export interface RequestResultsType {
  // TODO any
  fulfilled: any;
  rejected: PromiseSettledResult[];
}

export interface RequestOptionsType {
  concurrency: number;
  permanentAccessToken: string;
}

export interface RequestVariablesType {
  projectId: string;
  targetEnvironment: string;
  includeSystemFields?: boolean;
  includeApiOnlyFields?: boolean;
  includeHiddenFields?: boolean;
}
