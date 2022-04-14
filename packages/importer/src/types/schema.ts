interface SchemaLocaleType {
  apiId: string;
  isDefault: boolean;
}

interface SchemaEnumType {
  apiId: string;
}

interface SchemaFieldType {
  __typename: string;
  isSystem: boolean;
  apiId: string;
  type: string;
  isLocalized: string;
  enumeration: {
    values: SchemaEnumType[];
  };
}

interface SchemaModelType {
  isLocalized: boolean;
  apiId: string;
  fields: SchemaFieldType[];
}

export interface SchemaType {
  viewer: {
    project: {
      environment: {
        contentModel: {
          locales: SchemaLocaleType[];
          models: SchemaModelType[];
        };
      };
    };
  };
}
