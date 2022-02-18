import { gql } from 'graphql-request';
import { EnvironmentType, OptionsType } from '../main';
import processRequests from './processRequests';

interface ResultsType {
  viewer: {
    project: {
      environment: {
        contentModel: {
          allLocales: LocaleType[];
          models: ModelType[];
        }
      }
    }
  }
}

export interface ModelType {
  isLocalized: boolean;
  apiId: string;
  fields: any[];
}

export interface EnumerationsType {
  [key: string]: {
    [key: string]: string[];
  }
}

export interface LocaleType {
  apiId: string;
  isDefault: boolean;
}

export interface MetaType {
  enumerations: EnumerationsType; // TODO Make this optional, it might not exist if there are no enumerations
  allLocales: LocaleType[]; // TODO Make this optional, it might not exist if there are no locales
  localizedModels?: {
    [key: string]: boolean;
  }
}

const exportMeta = async (environment: EnvironmentType, options: OptionsType): Promise<MetaType> => {
  const query = gql`
  query SchemaQuery($projectId: ID! $targetEnvironment: String = "master") {
    viewer {
      ... on TokenViewer {
        project(id: $projectId) {
          environment(name: $targetEnvironment) {
                contentModel {
              allLocales: locales {
                apiId
                isDefault
              }
              models {
                isLocalized
                apiId
                fields {
                  __typename
                  apiId
                  ... on SimpleField {
                    type
                  }
                  ... on IRequireableField {
                    isRequired
                  }
                  ... on ILocalizableField {
                    isLocalized
                  }
                  ... on IUniqueableField {
                    isUnique
                  }
                  ... on SimpleField {
                    validations {
                      __typename
                      ... on StringFieldValidations {
                        characters {
                          stringCharMin: min
                          stringCharMax: max
                        }
                        listItemCount {
                          stringListMin: min
                          stringListMax: max
                        }
                        matches {
                          regex
                        }
                        notMatches {
                          regex
                        }
                      }
                      ... on IntFieldValidations {
                        range {
                          intFieldMin: min
                          intFieldMax: max
                        }
                        listItemCount {
                          intListMin: min
                          intListMax: max
                        }
                      }
                      ... on FloatFieldValidations {
                        range {
                          floatRangeMin: min
                          floatRangeMax: max
                        }
                        listItemCount {
                          floatListMin: min
                          flatListMax: max
                        }
                      }
                    }
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
  }`;

  try {
    console.log('… Querying schema for metadata…');

    const results: ResultsType = await processRequests(
      query,
      'https://management-next.graphcms.com/graphql',
      {
        concurrency: options.concurrency,
        permanentAccessToken: environment.permanentAccessToken,
      },
      {
        projectId: environment.projectId,
        targetEnvironment: environment.targetEnvironment,
      },
    );

    const { models, allLocales } = results.viewer.project.environment.contentModel;

    const localizedModels = models.reduce((parsedLocalizedModels, { apiId, isLocalized }) => (
      { ...parsedLocalizedModels, [apiId]: isLocalized }), {});

    const enumerations = models.reduce((parsedModels, { apiId: modelApiId, fields }) => {
      const enumerableFields = fields.filter((field) => field.enumeration);

      if (!enumerableFields.length) return parsedModels;

      const modelEnums = enumerableFields.reduce((
        parsedFields,
        { apiId: fieldApiId, enumeration },
      ) => (parsedFields[fieldApiId]
        ? parsedFields
        : { ...parsedFields, [fieldApiId]: enumeration.values.map(({ apiId }: { apiId: string }) => apiId) }), {});

      return { ...parsedModels, [modelApiId]: { ...modelEnums } };
    }, {});

    // TODO something with localizedModels and validations
    // ? It might actually be smart to somehow incorporate the validations in order to first check everything before actually running a mutation.
    // ? Otherwise It's easy that it creates 100+ entries before erroring out, which might create unique fields, causing more problems for the next run.

    return { allLocales, enumerations, localizedModels };
  } catch (error) {
    console.error(`\t${error}`);
    throw new Error('\tError retrieving metadata');
  }
};

export default exportMeta;
