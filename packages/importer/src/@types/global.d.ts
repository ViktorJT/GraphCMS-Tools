/* eslint-disable no-var */

/**
*** Input types
**/

export interface EnvironmentType {
  projectId: string;
  permanentAccessToken: string;
  contentApi: string;
}

export interface OptionsType {
  concurrency: number;
  targetStages: string[];
  newLocales: string[] | [];
  mode: string;
  exclude: {
    model: {
      [key: string]: boolean;
    }
    field: {
      [key: string]: boolean;
    }
  }
}

/**
*** Config types
**/

export interface MetaModelType {
  apiId: string;
  isLocalized: boolean;
  fields: MetaFieldType[];
}

export interface MetaReferenceType {
  model: {
    apiId: string;
  }
}

export interface MetaFieldType {
  apiId: string;
  isSystem: boolean;
  __typename: string;
  type?: string;
  isRequired?: boolean;
  isLocalized?: boolean;
  isUnique?: boolean;
  isMemberType?: boolean;
  union?: {
    memberTypes: MetaReferenceType[];
  }
  validations?: ValidationsType[];
}

export interface MetaContentModelTypes {
  allLocales: LocaleType[];
  models: MetaModelType[];
}

export interface MetaDataType {
  viewer: {
    project: {
      environment: {
        contentModel: MetaContentModelTypes;
      }
    }
  }
}

export interface EnumerationType {
  [key: string]: string[];
}

export interface ValidationsType {
  __typename: string;
  characters?: {
    stringCharMin: number;
    stringCharMax: number;
  }
  listItemCount?: {
    stringListMin: number;
    stringListMax: number;
  }
  matches?: {
    regex: RegExp;
  }
  notMatches?: {
    regex: RegExp;
  }
  range?: {
    intFieldMin: number;
    intFieldMax: number;
  }
  listItemCount?: {
    intListMin: number;
    intListMax: number;
  }
  range?: {
    floatRangeMin: number;
    floatRangeMax: number;
  }
  listItemCount?: {
    floatListMin: number;
    flatListMax: number;
  }
}

export interface LocaleType {
  apiId: string;
  isDefault: boolean;
}

export interface ExtendedEnvironmentType extends EnvironmentType {
  targetEnvironment: string;
}

/**
*** Data types
**/

export interface ModelType {
  [key: string]: InstanceType[];
}

export interface InstanceType {
  id: string;
  [key: string]: string | number | boolean | ReferenceType | ReferenceType[] | LocalizationType | null;
}

export interface LocalizationType {
  locale: string;
  [key: string]: string | number | boolean | ReferenceType | ReferenceType[] | null;
}

export interface DocumentInStagesType {
  stage: string;
  localizations?: { locale: string }[] | [];
}

/**
*** Request types
**/

export interface RequestResultsType {
  fulfilled: DataType[] | MetaDataType[] | [];
  rejected: PromiseRejectedResult[] | [];
}

export interface RequestVariablesType {
  projectId: string;
  targetEnvironment: string;
}

export interface ReferenceType {
  id: string;
}

/**
*** Global variable
**/

declare global {
  export interface ConfigType {
    options: OptionsType;
    environment: ExtendedEnvironmentType;
    allLocales: LocaleType[];
    defaultLocale: string;
    enumerations: EnumerationsType;
    localizedModels: {
      [key: string]: boolean;
    }
  }

  var config: ConfigType;
}

// export {}
