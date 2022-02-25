import { gql } from 'graphql-request';
const exportMeta = async (environment, options) => {
    const query = gql `
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
        console.log(global);
    }
    catch (error) {
        console.error(`\t${error}`);
        throw new Error('\tError retrieving metadata');
    }
};
export default exportMeta;
