"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_request_1 = require("graphql-request");
const processRequests_1 = __importDefault(require("./processRequests"));
const exportMeta = async (environment, options) => {
    const query = (0, graphql_request_1.gql) `
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
        const results = await (0, processRequests_1.default)(query, 'https://management-next.graphcms.com/graphql', {
            concurrency: options.concurrency,
            permanentAccessToken: environment.permanentAccessToken,
        }, {
            projectId: environment.projectId,
            targetEnvironment: environment.targetEnvironment,
        });
        const { models, allLocales } = results.viewer.project.environment.contentModel;
        const localizedModels = models.reduce((parsedLocalizedModels, { apiId, isLocalized }) => ({ ...parsedLocalizedModels, [apiId]: isLocalized }), {});
        const enumerations = models.reduce((parsedModels, { apiId: modelApiId, fields }) => {
            const enumerableFields = fields.filter((field) => field.enumeration);
            if (!enumerableFields.length)
                return parsedModels;
            const modelEnums = enumerableFields.reduce((parsedFields, { apiId: fieldApiId, enumeration }) => (parsedFields[fieldApiId]
                ? parsedFields
                : { ...parsedFields, [fieldApiId]: enumeration.values.map(({ apiId }) => apiId) }), {});
            return { ...parsedModels, [modelApiId]: { ...modelEnums } };
        }, {});
        // TODO something with localizedModels and validations
        // ? It might actually be smart to somehow incorporate the validations in order to first check everything before actually running a mutation.
        // ? Otherwise It's easy that it creates 100+ entries before erroring out, which might create unique fields, causing more problems for the next run.
        return { allLocales, enumerations, localizedModels };
    }
    catch (error) {
        console.error(`\t${error}`);
        throw new Error('\tError retrieving metadata');
    }
};
exports.default = exportMeta;
