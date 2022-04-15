/* eslint-disable no-var */
import type {OptionsType, EnvironmentType} from './index.js';

interface ExtendedEnvironmentType extends EnvironmentType {
  targetEnvironment: string;
}

declare global {
  type ConfigType = ExtendedEnvironmentType & OptionsType;

  var config: ConfigType;
}

export {};
