/* eslint-disable indent */
import { gql } from 'graphql-request';
import stringifyObject from 'stringify-object';

import type { EnumerationType, InstanceType, ModelType, LocalizationType } from '../@types/global'

const interpolateInstance = (
  name: string,
  id: string,
  localizedFields: any,
  defaultLocaleFields: any,
  nonLocalizedFields: any,
) => gql`
mutation ${global.config.options.mode}${name} {
  ${global.config.options.mode}${name}(
    where: { id: "${id}" }
    upsert: {
      create: {
        ${localizedFields.length
          ? `localizations: {
              create: [
                ${localizedFields.filter(({ locale }: {locale: string}) => locale !== global.config.defaultLocale).map(({ locale, fields }: {locale: string, fields: any}) => `
                  { locale: ${locale} data: { ${fields.join('\n')} } }
                `).join('\n')}
              ]}
              ${defaultLocaleFields?.fields || ''}`
          : ''}
        ${nonLocalizedFields.length
          ? nonLocalizedFields.map((field: any) => (field.create ? field.create : field)).join('\n')
          : ''
        }
      }
      update: {
        ${localizedFields.length
          ? `localizations: {
            upsert: [
              ${localizedFields.map(({ locale, fields }: {locale: string, fields: any}) => `
                { locale: ${locale} create: { ${fields.join('\n')} } update: { ${fields.join('\n')} } }
              `).join('\n')}
            ]}`
          : ''}
        ${nonLocalizedFields.length
          ? nonLocalizedFields.map((field: any) => (field.update ? field.update : field)).join('\n')
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
        ${localizedFields.length
        ? `localizations {
          locale
        }`
        : ''}
      }
    }
  }
`;

const parseFields = (
  fields: any,
  enumerations: {[key: string]: string[]},
) => Object.entries(fields)
  .filter(([key, value]: [key: string, value: any]) => {

    if (global.config.options.exclude.field[key]) return false;
    if (typeof value !== 'boolean' && !value) return false;
    if (Array.isArray(value) && !value.length) return false;
    return true;
  })
  .map(([key, value]: [key: string, value: any]) => {

    if (key === 'createdAt' || key === 'updatedAt') return { create: `${key}: "${value}"`, update: ' ' };
    if (value?.id) {
      return value?.__typename
        ? `${key}: { connect: { ${value.__typename}: { id: "${value.id}" }} }`
        : `${key}: { connect: { id: "${value.id}" } }`;
    }
    if (value?.longitude || value?.latitude || value?.hex || value?.raw) {
      return `${key}: ${stringifyObject(value.raw ? value.raw : value, { singleQuotes: false })}`;
    }
    if (enumerations && enumerations[key]) {
      return Array.isArray(value)
        ? `${key}: [${value}]`
        : `${key}: ${value}`;
    }
    if (Array.isArray(value)) {
      if (typeof value[0] === 'string') return `${key}: [${value.map((item) => `${JSON.stringify(item)}`)}]`;
      if (typeof value[0] === 'number') return value.map((itemValue) => `${key}: ${itemValue}`);
      if (value[0].id) {
        return value[0].__typename
        ? {
            create: `${key}: { connect: ${stringifyObject(value.map(({ __typename, ...item }) => ({ [__typename]: { ...item } })), { singleQuotes: false })}}`,
            update: `${key}: { connect: ${stringifyObject(value.map(({ __typename, ...item }) => ({ [__typename]: { where: { ...item } } })), { singleQuotes: false })}}`,
          }
        : {
            create: `${key}: { connect: ${stringifyObject(value.map((item) => item), { singleQuotes: false })}}`,
            update: `${key}: { connect: ${stringifyObject(value.map((item) => ({ where: item })), { singleQuotes: false })}}`,
        };
      }
    }
    if (typeof value === 'number' || typeof value === 'boolean') return `${key}: ${value}`;
    return `${key}: ${JSON.stringify(value)}`;
  });

const triageFields = (
  { localizations, ...nonLocalizedFields }: any,
  modelEnumerations: EnumerationType,
  ): [any[],any[],any[]] => {

  const filteredLocales = localizations?.reduce((locales: any, { locale, ...localizedFields }: LocalizationType) => {
    const fields = parseFields(localizedFields, modelEnumerations);
    return fields.length
      ? [...locales, { locale, fields }]
      : locales;
  }, []);

  const filteredNonLocalizedFields = parseFields(nonLocalizedFields, modelEnumerations);

  const defaultLocaleFields = filteredLocales.filter(({ locale }: { locale: string }) => locale === global.config.defaultLocale)[0];

  return [
    filteredLocales || [],
    filteredNonLocalizedFields || [],
    defaultLocaleFields || [],
  ];
};

const parseInstance = (
  name: string,
  { id, ...instance }: InstanceType,
  modelEnumerations: EnumerationType,
): string | null => {
  const [localizedFields, nonLocalizedFields, defaultLocaleFields] = triageFields(instance, modelEnumerations);


  if (localizedFields.length > 0 || nonLocalizedFields.length > 0) {
    const instanceMutation = interpolateInstance(
      name,
      id,
      localizedFields,
      defaultLocaleFields,
      nonLocalizedFields,
    );
    return instanceMutation;
  }
  return null;
};

const generateContentMutations = (data: ModelType[]): string[] | [] => {
  console.log('… Generating mutations…');

  const contentMutations = data.reduce((parsedModels: string[] | [], model: ModelType) => {
    const [name, instances] = Object.entries(model)[0];

    if (global.config.options.exclude.model[name]) return parsedModels;

    const instanceMutation = instances.reduce((parsedInstances: string[] | [], instance: InstanceType) => {
      const parsedInstance = parseInstance(name, instance, global.config.enumerations[name]);

      return parsedInstance ? [...parsedInstances, parsedInstance] : parsedInstances;
    }, []);

    return instanceMutation
      ? [...parsedModels, ...instanceMutation]
      : parsedModels;
  }, []);

  return contentMutations;
};

export default generateContentMutations;
