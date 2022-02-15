import { gql } from 'graphql-request';
import config from '../config';
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

export interface ProjectType {
  environment: {
    contentModel: {
      models: ModelType[];
    }
  }
}

const exportSchema = async (): Promise<ProjectType> => {
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
    const targetEnvironmentRegex = /\w+$/g;

    if (!process.env.GRAPHCMS_PROJECT_ID) throw new Error('Please provide a valid project ID');
    if (!process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN) throw new Error('Please provide a valid project ID');
    if (!process.env.GRAPHCMS_CONTENT_API) throw new Error('Please provide a valid content api url')
    if (!targetEnvironmentRegex.test(process.env.GRAPHCMS_CONTENT_API)) {
      throw new Error('Please provide a content api url containing a valid target environment');
    };

    const targetEnvironment: RegExpExecArray | null = targetEnvironmentRegex.exec(process.env.GRAPHCMS_CONTENT_API);

    const results = await processRequests(query, 'management', {
      projectId: process.env.GRAPHCMS_PROJECT_ID,
      targetEnvironment: targetEnvironment ? targetEnvironment[0] : 'master',
      ...config.include,
    });

    return results[0].viewer.project;
  } catch (error) {
    console.error(`\t${error}`);
    throw new Error('\tError exporting schema');
  }
};

export default exportSchema;
