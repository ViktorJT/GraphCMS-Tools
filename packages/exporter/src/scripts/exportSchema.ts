import {gql} from 'graphql-request';
import type {OptionsType, EnvironmentType} from '../@types/main';
import type {FieldType, ModelType} from '../@types/schema';
import processRequests from './processRequests';

const exportSchema = async (
  environment: EnvironmentType,
  options: OptionsType
): Promise<ModelType[]> => {
  const query: string = gql`
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

    // TODO Add 'hasContent' to each model to more easily filter out crap

    const results: any = await processRequests(
      query,
      'https://management-next.graphcms.com/graphql',
      {
        concurrency: 1,
        permanentAccessToken: environment.permanentAccessToken,
      },
      {
        projectId: environment.projectId,
        targetEnvironment: environment.targetEnvironment,
        includeSystemFields: options.include.includeSystemFields,
        includeApiOnlyFields: options.include.includeApiOnlyFields,
        includeHiddenFields: options.include.includeHiddenFields,
      }
    );

    return results[0].viewer.project.environment.contentModel.models;
  } catch (error) {
    console.error(`\t${error}`);
    throw new Error('\tError exporting schema');
  }
};

export default exportSchema;
