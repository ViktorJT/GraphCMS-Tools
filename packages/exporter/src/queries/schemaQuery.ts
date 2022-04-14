import {gql} from 'graphql-request';

export const schemaQuery: string = gql`
  query SchemaQuery(
    $projectId: ID!
    $targetEnvironment: String = "master"
    $includeSystemModels: Boolean = true
    $includeApiOnlyFields: Boolean = true
    $includeHiddenFields: Boolean = true
  ) {
    viewer {
      ... on TokenViewer {
        project(id: $projectId) {
          environment(name: $targetEnvironment) {
            contentModel {
              models(includeSystemModels: $includeSystemModels) {
                apiId
                apiIdPlural
                isLocalized
                fields(
                  includeHiddenFields: $includeHiddenFields
                  includeApiOnlyFields: $includeApiOnlyFields
                ) {
                  apiId
                  isSystem
                  __typename
                  ... on ILocalizableField {
                    isLocalized
                  }
                  ... on UnionField {
                    isMemberType
                    union {
                      memberTypes {
                        model {
                          apiId
                        }
                      }
                    }
                  }
                  ... on SimpleField {
                    type
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default schemaQuery;
