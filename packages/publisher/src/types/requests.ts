export interface RequestResultsType {
  fulfilled: ContentMutationsType[];
  rejected: PromiseSettledResult<PromiseRejectedResult>[];
}

export interface ContentMutationsType {
  [key: string]: {
    id: string;
    __typename: string;
    documentInStages: DocumentInStagesType[];
  };
}

export interface DocumentInStagesType {
  stage: string;
  localizations?: {locale: string}[];
}

export interface RequestVariablesType {
  permanentAccessToken: string;
  projectId: string;
  targetEnvironment: string;
  contentApi: string;
  concurrency: number;
}
