/* eslint-disable no-var */
import type {OptionsType, EnvironmentType} from '../main';

export interface ExtendedEnvironmentType extends EnvironmentType {
  targetEnvironment: string;
}

declare global {
  type ConfigType = OptionsType & ExtendedEnvironmentType;

  export interface MetaDataType {
    // allLocales: LocaleType[];
    // defaultLocale: string;
    // enumerations: EnumerationsType;
    // localizedModels: LocalizedModelsType;
  }

  var config: ConfigType;
  // var metadata: MetaDataType;
}

// export {}
