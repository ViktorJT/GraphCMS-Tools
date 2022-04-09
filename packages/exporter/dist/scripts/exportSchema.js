import { gql } from 'graphql-request';
import processRequests from './processRequests';
const exportSchema = async (environment, options) => {
    const query = gql `
    query SchemaQuery(
      $projectId: ID!
      $targetEnvironment: String = "master"
      $includeSystemModels: Boolean = true
      $includeHiddenFields: Boolean = true
      $includeApiOnlyFields: Boolean = true
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
    try {
        console.log('… Querying schema…');
        const results = await processRequests(query, 'https://management-next.graphcms.com/graphql', {
            concurrency: 1,
            permanentAccessToken: environment.permanentAccessToken,
        }, {
            projectId: environment.projectId,
            targetEnvironment: environment.targetEnvironment,
            includeSystemFields: options.include.includeSystemFields,
            includeApiOnlyFields: options.include.includeApiOnlyFields,
            includeHiddenFields: options.include.includeHiddenFields,
        });
        return results[0].viewer.project.environment.contentModel.models;
    }
    catch (error) {
        console.error(`\t${error}`);
        throw new Error('\tError exporting schema');
    }
};
export default exportSchema;
