interface RelationType {
  model: {
    apiId: string;
  };
}

export interface FieldType {
  apiId: string;
  type?: string;
  isSystem: boolean;
  __typename: string;
  isLocalized: boolean;
  isMemberType?: boolean;
  union?: {
    memberTypes: RelationType[];
  };
}

export interface ModelType {
  apiId: string;
  apiIdPlural: string;
  isLocalized: boolean;
  fields: FieldType[];
}
