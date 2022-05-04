/* eslint-disable indent */
import lowerCaseFirstLetter from '../helpers/lowerCaseFirstLetter.js';
import {ModelType, FieldType} from '../types/index.js';

const triage = (mode: 'field' | 'model', apiId: string, isSystem?: boolean): boolean => {
  if (apiId === 'id') return true;

  if (mode === 'model' && global.exportConfig.mode.modelSearch) {
    return global.exportConfig.search.models.includes(apiId);
  }

  if (mode === 'field' && global.exportConfig.mode.fieldSearch) {
    return global.exportConfig.search.fields.includes(apiId);
  }

  if (global.exportConfig.exclude.field[apiId]) return false;
  if (global.exportConfig.exclude.model[apiId]) return false;

  if (global.exportConfig.include.includeSystemFields === false && isSystem) return false;

  return true;
};

const assertLocalization = (
  fields: FieldType[],
  modelIsLocalized: boolean
): Array<FieldType[] | null> =>
  modelIsLocalized
    ? fields.reduce(
        (separatedFields: Array<FieldType[] | []>, field: FieldType) =>
          field.isLocalized
            ? [[...separatedFields[0]], [...separatedFields[1], field]]
            : [[...separatedFields[0], field], [...separatedFields[1]]],
        [[], []]
      )
    : [fields, null];

const assertFieldSubType = (apiId: string, type?: string) => {
  if (type && global.exportConfig.exclude.subType[type]) return ' ';
  switch (type) {
    case 'RICHTEXT':
      return `${apiId} { raw }`;
    case 'LOCATION':
      return `${apiId} { latitude\nlongitude }`;
    case 'COLOR':
      return `${apiId} { hex }`;
    default:
      return `${apiId}`;
  }
};

// TODO replace this with stringifyObject? I'm only using it to set the correct quotes I think.
const assertFieldType = ({apiId, __typename, ...field}: FieldType) => {
  if (global.exportConfig.exclude.type?.[__typename]) return ' ';
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
            ${
              field.union !== undefined &&
              field.union.memberTypes
                .map((relatedModel) => `... on ${relatedModel.model.apiId} { id, __typename }`)
                .join('')
            }
          }`;
    default:
      return `${apiId}`;
  }
};

const parseFields = (fields: FieldType[]) =>
  fields.reduce(
    (parsedFields: string[], field: FieldType): string[] =>
      triage('field', field.apiId, field.isSystem)
        ? [...parsedFields, assertFieldType(field)]
        : parsedFields,
    []
  );

const generateQueries = (schema: ModelType[]) => {
  const contentQueries = schema.reduce(
    (
      parsedQueries: string[],
      {
        apiId: modelApiId,
        apiIdPlural: modelApiIdPlural,
        isLocalized: modelIsLocalized,
        fields: modelFields,
      }: ModelType
    ) => {
      const [nonLocalizedFields, localizedFields] = assertLocalization(
        modelFields,
        modelIsLocalized
      );

      // TODO: add exportConfig to pretty print json or not (remove newlines & shit)?

      return triage('model', modelApiId)
        ? [
            ...parsedQueries,
            `query ${modelApiId} {
          ${modelApiId}: ${lowerCaseFirstLetter(modelApiIdPlural)}(
              stage: ${global.exportConfig.target.contentStage}
              first: 1000
            ) {
            ${
              modelIsLocalized
                ? `localizations(includeCurrent: true ${
                    global.exportConfig.target.locales.length
                      ? `locales: [${global.exportConfig.target.locales}]`
                      : ''
                  }) {
                  locale
                  ${localizedFields !== null && parseFields(localizedFields)}
                }
                ${nonLocalizedFields !== null && parseFields(nonLocalizedFields)}}`
                : `${nonLocalizedFields !== null && parseFields(nonLocalizedFields)}}`
            }
          }
        `,
          ]
        : parsedQueries;
    },
    []
  );

  return contentQueries;
};

export default generateQueries;
