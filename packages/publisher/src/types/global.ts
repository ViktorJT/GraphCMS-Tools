/* eslint-disable no-var */
import type {OptionsType, EnvironmentType, MetadataType} from './index.js';

interface ExtendedEnvironmentType extends EnvironmentType {
  targetEnvironment: string;
}

declare global {
  type ConfigType = ExtendedEnvironmentType & OptionsType & MetadataType;

  var config: ConfigType;
}

export {};
