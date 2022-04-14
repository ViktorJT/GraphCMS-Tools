/* eslint-disable no-var */
import type {OptionsType, EnvironmentType} from './main.js';

interface ExtendedEnvironmentType extends EnvironmentType {
  targetEnvironment: string;
}

declare global {
  type ConfigType = OptionsType & ExtendedEnvironmentType;

  var config: ConfigType;
}

export {};
