/* eslint-disable indent */
import config from '../config';
import { ProjectType, ModelType, FieldType } from './exportSchema'

const lowerCaseFirstLetter = (string: string): string => string.charAt(0).toLowerCase() + string.slice(1);

const triage = (apiId: string, isSystem?: boolean): boolean => {
  if (apiId === 'id') return true;
  if (config.exclude.field[apiId]) return false;
  if (config.exclude.model[apiId]) return false;
  if (config.include.includeSystemFields === false && isSystem) return false;
  return true;
};

const assertLocalization = (fields: FieldType[], modelIsLocalized: boolean): Array<FieldType[] | null> => (modelIsLocalized
  ? fields.reduce(
    (separatedFields: Array<FieldType[] | []>, field: FieldType) => field.isLocalized
      ? [[...separatedFields[0]], [...separatedFields[1], field]]
      : [[...separatedFields[0], field], [...separatedFields[1]]],
    [[], []],
  )
  : [fields, null]);

const assertFieldSubType = (apiId: string, type?: string) => {
  if (type && config.exclude.subType[type]) return ' ';
  switch (type) {
    case 'RICHTEXT': return `${apiId} { raw }`;
    case 'LOCATION': return `${apiId} { latitude\nlongitude }`;
    case 'COLOR': return `${apiId} { hex }`;
    default: return `${apiId}`;
  }
};

// TODO replace this with stringifyObject? I'm only using it to set the correct quotes I think.
const assertFieldType = ({ apiId, __typename, ...field }: FieldType) => {
  if (config.exclude.type[__typename]) return ' ';
  switch (__typename) {
    case 'SimpleField':
      return assertFieldSubType(apiId, field.type);
    case 'RelationalField':
    case 'UniDirectionalRelationalField':
      return `${apiId} { id }`;
    case 'UnionField':
      return field.isMemberType === true
        ? `${apiId} { id }`
        : `${apiId} {
            ${field.union !== undefined && field.union.memberTypes.map((relatedModel) => `... on ${relatedModel.model.apiId} { id, __typename }`).join('\n')}
          }`;
    default:
      return `${apiId}`;
  }
};

const parseFields = (fields: FieldType[]) => fields.reduce(
    (parsedFields: string[], field: FieldType): string[] => triage(field.apiId, field.isSystem)
      ? [...parsedFields, assertFieldType(field)]
      : parsedFields,
    [],
);

const generateQueries = (schema: ProjectType) => {
  console.log('… Generating queries…');

  const allModels = schema.environment.contentModel.models;

  const contentQueries = allModels.reduce((parsedQueries: string[], {
    apiId: modelApiId,
    apiIdPlural: modelApiIdPlural,
    isLocalized: modelIsLocalized,
    fields: modelFields,
  }: ModelType) => {
    const [nonLocalizedFields, localizedFields] = assertLocalization(modelFields, modelIsLocalized);

    // TODO: add config to pretty print json or not (remove newlines & shit)?

    return triage(modelApiId)
      ? [...parsedQueries, `query ${modelApiId} {
          ${modelApiId}: ${lowerCaseFirstLetter(modelApiIdPlural)}(
              stage: ${config.targetContentStage}
              first: 1000
            ) {
            ${modelIsLocalized
              ? `localizations( includeCurrent: true ${config.targetLocales.length
                ? `locales: [${config.targetLocales}]`
                : ''
                }) {
                  locale
                  ${localizedFields !== null && parseFields(localizedFields)}
                }
                ${nonLocalizedFields !== null && parseFields(nonLocalizedFields)}\n}`
              : `${nonLocalizedFields !== null && parseFields(nonLocalizedFields)}\n}`
            }
          }
        `]
      : parsedQueries;
  }, []);

  console.log(`\tSuccessfully generated ${contentQueries.length} queries`);

  return contentQueries;
};

export default generateQueries;
