interface MetadataLocaleType {
  apiId: string;
  isDefault: boolean;
}

export interface MetadataModelEnumerationType {
  [key: string]: string[];
}

interface MetadataEnumerationsType {
  [key: string]: MetadataModelEnumerationType;
}

export interface MetadataType {
  defaultLocale: string;
  locales: MetadataLocaleType[];
  enumerations: MetadataEnumerationsType;
}
