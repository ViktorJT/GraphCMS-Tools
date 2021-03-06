/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable indent */
import {gql} from 'graphql-request';
import stringifyObject from 'stringify-object';
import type {
  DataType,
  InstanceType,
  FieldsType,
  LocalizationType,
  MetadataModelEnumerationType,
} from '../types/index.js';

const interpolateInstance = (
  name: string,
  id: string,
  localizedFields: LocalizationType[],
  defaultLocaleFields: FieldsType,
  nonLocalizedFields: FieldsType
): string => gql`
mutation upsert${name} {
  upsert${name}(
    where: { id: "${id}" }
    upsert: {
      create: {
        ${
          localizedFields.length
            ? `localizations: {
              create: [
                ${localizedFields
                  .filter(
                    ({locale}: {locale: string}) => locale !== global.importConfig.defaultLocale
                  )
                  .map(
                    ({locale, fields}: {locale: string; fields: any}) => `
                  { locale: ${locale} data: { ${fields.join('\n')} } }
                `
                  )
                  .join('\n')}
              ]}
              ${defaultLocaleFields?.fields || ''}`
            : ''
        }
        ${
          nonLocalizedFields.length
            ? nonLocalizedFields
                .map((field: any) => (field.create ? field.create : field))
                .join('\n')
            : ''
        }
      }
      update: {
        ${
          localizedFields.length
            ? `localizations: {
            upsert: [
              ${localizedFields
                .map(
                  ({locale, fields}: {locale: string; fields: any}) => `
                { locale: ${locale} create: { ${fields.join('\n')} } update: { ${fields.join(
                    '\n'
                  )} } }
              `
                )
                .join('\n')}
            ]}`
            : ''
        }
        ${
          nonLocalizedFields.length
            ? nonLocalizedFields
                .map((field: any) => (field.update ? field.update : field))
                .join('\n')
            : ''
        }
      }
    }
  )
    {
      id
      __typename
      documentInStages {
        stage
        ${
          localizedFields.length
            ? `localizations {
          locale
        }`
            : ''
        }
      }
    }
  }
`;

const parseFields = (fields: FieldsType, modelEnumerations: MetadataModelEnumerationType) =>
  Object.entries(fields)
    .filter(([key, value]: [key: string, value: any]): boolean => {
      if (global.importConfig.exclude.field[key]) return false;
      if (typeof value !== 'boolean' && !value) return false;
      if (Array.isArray(value) && !value.length) return false;
      return true;
    })
    .map(([key, value]: [key: string, value: any]) => {
      if (key === 'createdAt' || key === 'updatedAt')
        return {create: `${key}: "${value}"`, update: ' '};
      if (value?.id) {
        return value?.__typename
          ? `${key}: { connect: { ${value.__typename}: { id: "${value.id}" }} }`
          : `${key}: { connect: { id: "${value.id}" } }`;
      }
      if (value?.longitude || value?.latitude || value?.hex || value?.raw) {
        return `${key}: ${stringifyObject(value.raw ? value.raw : value, {singleQuotes: false})}`;
      }
      if (modelEnumerations && modelEnumerations[key]) {
        return Array.isArray(value) ? `${key}: [${value}]` : `${key}: ${value}`;
      }
      if (Array.isArray(value)) {
        if (typeof value[0] === 'string')
          return `${key}: [${value.map((item) => `${JSON.stringify(item)}`)}]`;
        if (typeof value[0] === 'number') return value.map((itemValue) => `${key}: ${itemValue}`);
        if (value[0].id) {
          return value[0].__typename
            ? {
                create: `${key}: { connect: ${stringifyObject(
                  value.map(({__typename, ...item}) => ({[__typename]: {...item}})),
                  {singleQuotes: false}
                )}}`,
                update: `${key}: { connect: ${stringifyObject(
                  value.map(({__typename, ...item}) => ({[__typename]: {where: {...item}}})),
                  {singleQuotes: false}
                )}}`,
              }
            : {
                create: `${key}: { connect: ${stringifyObject(
                  value.map((item) => item),
                  {singleQuotes: false}
                )}}`,
                update: `${key}: { connect: ${stringifyObject(
                  value.map((item) => ({where: item})),
                  {singleQuotes: false}
                )}}`,
              };
        }
      }
      if (typeof value === 'number' || typeof value === 'boolean') return `${key}: ${value}`;
      return `${key}: ${JSON.stringify(value)}`;
    });

const triageFields = (
  {localizations, ...nonLocalizedFields}: Omit<InstanceType, 'id'>,
  modelEnumerations: MetadataModelEnumerationType
) => {
  const filteredLocales = localizations?.reduce((locales, {locale, ...localizedFields}) => {
    const fields = parseFields(localizedFields, modelEnumerations);
    return fields.length ? [...locales, {locale, fields}] : locales;
  }, []);

  const filteredNonLocalizedFields = parseFields(nonLocalizedFields, modelEnumerations);

  const defaultLocaleFields = filteredLocales?.filter(
    ({locale}: {locale: string}) => locale === global.importConfig.defaultLocale
  )[0];

  if (defaultLocaleFields?.length) console.log('test', defaultLocaleFields);

  return [filteredLocales || [], filteredNonLocalizedFields || [], defaultLocaleFields || []];
};

const parseInstance = (
  name: string,
  {id, ...instance}: InstanceType,
  modelEnumerations: MetadataModelEnumerationType
): string | null => {
  const [localizedFields, nonLocalizedFields, defaultLocaleFields] = triageFields(
    instance,
    modelEnumerations
  );

  if (localizedFields.length > 0 || nonLocalizedFields.length > 0) {
    const instanceMutation = interpolateInstance(
      name,
      id,
      localizedFields,
      defaultLocaleFields,
      nonLocalizedFields
    );
    return instanceMutation;
  }
  return null;
};

const generateContentMutations = (data: DataType[]): string[] => {
  const contentMutations = data.reduce((parsedModels: string[], model) => {
    const [name, instances] = Object.entries(model)[0];

    if (global.importConfig.exclude.model[name]) return parsedModels;

    const modelEnumerations = global.importConfig.enumerations[name];

    const instanceMutation = instances.reduce((parsedInstances: string[], instance) => {
      const parsedInstance = parseInstance(name, instance, modelEnumerations);

      return parsedInstance ? [...parsedInstances, parsedInstance] : parsedInstances;
    }, []);

    return instanceMutation ? [...parsedModels, ...instanceMutation] : parsedModels;
  }, []);

  return contentMutations;
};

export default generateContentMutations;
