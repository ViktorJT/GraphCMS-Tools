interface LocalizationType {
  [key: string]: {
    locale: string;
  };
}

interface DocumentInStagesType {
  stage: string;
  localizations?: LocalizationType[];
}

export interface DataType {
  [key: string]: {
    id: string;
    __typename: string;
    documentInStages: DocumentInStagesType[];
  };
}

export interface EnvironmentType {
  permanentAccessToken: string;
  contentApi: string;
}

export interface OptionsType {
  concurrency?: number;
  exclude?: {
    model?: {
      [key: string]: boolean;
    };
  };
}
