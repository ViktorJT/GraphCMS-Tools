/* eslint-disable indent */
import { OptionsType } from '../main';
import { ModelType, FieldType } from './exportSchema';

// eslint-disable-next-line max-len
const lowerCaseFirstLetter = (string: string): string => string.charAt(0).toLowerCase() + string.slice(1);

const triage = (apiId: string, options: OptionsType, isSystem?: boolean): boolean => {
  if (apiId === 'id') return true;
  if (options.exclude.field[apiId]) return false;
  if (options.exclude.model[apiId]) return false;
  if (options.include.includeSystemFields === false && isSystem) return false;
  return true;
};

const assertLocalization = (
  fields: FieldType[],
  modelIsLocalized: boolean,
): Array<FieldType[] | null> => (modelIsLocalized
  ? fields.reduce(
    (separatedFields: Array<FieldType[] | []>, field: FieldType) => (field.isLocalized
      ? [[...separatedFields[0]], [...separatedFields[1], field]]
      : [[...separatedFields[0], field], [...separatedFields[1]]]),
    [[], []],
  )
  : [fields, null]);

const assertFieldSubType = (apiId: string, options: OptionsType, type?: string) => {
  if (type && options.exclude.subType[type]) return ' ';
  switch (type) {
    case 'RICHTEXT': return `${apiId} { raw }`;
    case 'LOCATION': return `${apiId} { latitude\nlongitude }`;
    case 'COLOR': return `${apiId} { hex }`;
    default: return `${apiId}`;
  }
};

// TODO replace this with stringifyObject? I'm only using it to set the correct quotes I think.
const assertFieldType = ({ apiId, __typename, ...field }: FieldType, options: OptionsType) => {
  if (options.exclude.type[__typename]) return ' ';
  switch (__typename) {
    case 'SimpleField':
      return assertFieldSubType(apiId, options, field.type);
    case 'RelationalField':
    case 'UniDirectionalRelationalField':
      return `${apiId} { id }`;
    case 'UnionField':
      return field.isMemberType === true
        ? `${apiId} { id }`
        : `${apiId} {
            ${field.union !== undefined
              && field.union.memberTypes.map((relatedModel) => `... on ${relatedModel.model.apiId} { id, __typename }`).join('\n')}
          }`;
    default:
      return `${apiId}`;
  }
};

const parseFields = (fields: FieldType[], options: OptionsType) => fields.reduce(
    (parsedFields: string[], field: FieldType): string[] => (triage(field.apiId, options, field.isSystem)
      ? [...parsedFields, assertFieldType(field, options)]
      : parsedFields),
    [],
);

const generateQueries = (schema: ModelType[], options: OptionsType) => {
  console.log('… Generating queries…');

  const contentQueries = schema.reduce((parsedQueries: string[], {
    apiId: modelApiId,
    apiIdPlural: modelApiIdPlural,
    isLocalized: modelIsLocalized,
    fields: modelFields,
  }: ModelType) => {
    const [nonLocalizedFields, localizedFields] = assertLocalization(modelFields, modelIsLocalized);

    // TODO: add config to pretty print json or not (remove newlines & shit)?

    return triage(modelApiId, options)
      ? [...parsedQueries, `query ${modelApiId} {
          ${modelApiId}: ${lowerCaseFirstLetter(modelApiIdPlural)}(
              stage: ${options.targetContentStage}
              first: 1000
            ) {
            ${modelIsLocalized
              ? `localizations( includeCurrent: true ${options.targetLocales.length
                ? `locales: [${options.targetLocales}]`
                : ''
                }) {
                  locale
                  ${localizedFields !== null && parseFields(localizedFields, options)}
                }
                ${nonLocalizedFields !== null && parseFields(nonLocalizedFields, options)}\n}`
              : `${nonLocalizedFields !== null && parseFields(nonLocalizedFields, options)}\n}`
            }
          }
        `]
      : parsedQueries;
  }, []);

  console.log(`\tSuccessfully generated ${contentQueries.length} queries`);

  return contentQueries;
};

export default generateQueries;
