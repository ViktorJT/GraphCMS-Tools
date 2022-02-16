import { gql } from 'graphql-request';
import { OptionsType, EnvironmentType } from '../main';
import processRequests from './processRequests';

interface RelationType {
  model: {
    apiId: string;
  }
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

const exportSchema = async (
  environment: EnvironmentType,
  options: OptionsType,
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

    const results = await processRequests(
      query,
      'https://management-next.graphcms.com/graphql',
      {
        concurrency: options.concurrency,
        permanentAccessToken: environment.permanentAccessToken,
      },
      {
        projectId: environment.projectId,
        targetEnvironment: environment.targetEnvironment,
        includeSystemFields: options.include.includeSystemFields,
        includeApiOnlyFields: options.include.includeApiOnlyFields,
        includeHiddenFields: options.include.includeHiddenFields,
      },
    );

    return results[0].viewer.project.environment.contentModel.models;
  } catch (error) {
    console.error(`\t${error}`);
    throw new Error('\tError exporting schema');
  }
};

export default exportSchema;
