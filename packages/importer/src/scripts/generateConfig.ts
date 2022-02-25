import { gql } from 'graphql-request';
import type { EnvironmentType, OptionsType, LocaleType, MetaModelType, MetaContentModelTypes } from '../@types/global';
import processRequests from './processRequests';

const exportConfig = async (
  environment: EnvironmentType,
  options: OptionsType
): Promise<ConfigType> => {
  const query = gql`
  query SchemaQuery($projectId: ID! $targetEnvironment: String) {
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
                  isSystem
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

    const targetEnvironmentRegex = /\w+$/g;
    const matches: RegExpExecArray | null = targetEnvironmentRegex.exec(environment.contentApi);

    if (!matches || !matches.length) {
      throw new Error('No environment found. Please provide a content api url containing a valid target environment');
    }
    const targetEnvironment = matches[0];

    const results = await processRequests(query, 'https://management-next.graphcms.com/graphql');

    if (!results) throw new Error('Unable to retrieve results from management api')

    const { models, allLocales }: MetaContentModelTypes = results.fulfilled[0].viewer.project.environment.contentModel;

    const defaultLocale = allLocales.find((locale: LocaleType) => locale.isDefault)?.apiId;

    const localizedModels = models.reduce((parsedLocalizedModels: {[key: string]: boolean}, { apiId, isLocalized }: MetaModelType ) => (
      { ...parsedLocalizedModels, [apiId]: isLocalized }), {});

    const enumerations = models.reduce((parsedModels: {[key: string]: MetaModelType}, { apiId: modelApiId, fields }: MetaModelType) => {
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

    return {
      allLocales,
      defaultLocale,
      enumerations,
      localizedModels,
      environment: {...environment, targetEnvironment },
      options
    };
  } catch (error) {
    console.error(`\t${error}`);
    throw new Error('\tError retrieving metadata');
  }
};

export default exportConfig;
