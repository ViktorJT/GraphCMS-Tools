export interface DataType {
  [key: string]: InstanceType[];
}

export interface InstanceType {
  id: string;
  localizations?: LocalizationType;
  [key: string]: any;
}

export interface FieldsType {
  [key: string]: any;
}

export interface LocalizationType {
  locale: string;
  [key: string]: any;
}

export interface EnvironmentType {
  projectId: string;
  permanentAccessToken: string;
  contentApi: string;
}

export interface OptionsType {
  concurrency: number;
  publish?: {
    targetStages: string[];
    newLocales: string[] | [];
  };
  exclude: {
    model: {
      [key: string]: boolean;
    };
    field: {
      [key: string]: boolean;
    };
  };
}
