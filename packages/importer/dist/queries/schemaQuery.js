import { gql } from 'graphql-request';
export const schemaQuery = gql `
  query SchemaQuery($projectId: ID!, $targetEnvironment: String!) {
    viewer {
      ... on TokenViewer {
        project(id: $projectId) {
          environment(name: $targetEnvironment) {
            contentModel {
              locales {
                apiId
                isDefault
              }
              models {
                isLocalized
                apiId
                fields {
                  __typename
                  isSystem
                  apiId
                  ... on SimpleField {
                    type
                  }
                  ... on ILocalizableField {
                    isLocalized
                  }
                  ... on EnumerableField {
                    enumeration {
                      values {
                        apiId
                      }
                    }
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
