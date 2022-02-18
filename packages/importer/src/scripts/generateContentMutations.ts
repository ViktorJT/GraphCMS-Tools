/* eslint-disable indent */
import { gql } from 'graphql-request';
import { OptionsType } from '../main';
import { EnumerationsType } from './exportMeta';
import stringifyObject from 'stringify-object';

interface InstanceType {
  localizations?: any[];
  id: string;
  createdAt: string;
  createdBy: {
    id: string;
  }
  updatedAt: string;
  updatedBy: string;
  publishedAt: string;
  publishedBy: string;
  scheduledIn: any;
  [key: string]: any;
}

interface ModelType {
  [key: string]: InstanceType[]
}

interface MetaType {
  defaultLocale: string;
  enumerations: EnumerationsType;
}

interface ModelEnumerationsType {
    [key: string]: string[];
  }

// TODO Make a variable for hasLocalizedFields or hasNonLocalizedFields to not have to check length everywhere
// TODO FIlter the localizedFields for en locale before this step, like I do for defaultLocaleFields?
const interpolateInstance = (
  name: string,
  id: string,
  localizedFields: any, // TODO
  defaultLocale: string,
  defaultLocaleFields: any, // TODO
  nonLocalizedFields: any, // TODO
  options: OptionsType,
) => gql`
mutation ${options.mode}${name} {
  ${options.mode}${name}(
    where: { id: "${id}" }
    upsert: {
      create: {
        ${localizedFields.length
          ? `localizations: {
              create: [
                ${localizedFields.filter(({ locale }: {locale: string}) => locale !== defaultLocale).map(({ locale, fields }: {locale: string, fields: any}) => `
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
  fields: any, // TODO
  enumerations: {[key: string]: string[]},
  options: OptionsType
) => Object.entries(fields)
  .filter(([key, value]: [key: string, value: any]) => {
    // TODO check validations against metadata?
    if (options.exclude.field[key]) return false;
    if (typeof value !== 'boolean' && !value) return false;
    if (Array.isArray(value) && !value.length) return false;
    return true;
  })
  .map(([key, value]: [key: string, value: any]) => {
    // TODO: Make an assumeType function that just returns a string corresponding to a __typename or type
    // TODO: Find better way to identify fields that need to be wrapped
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
  { localizations, ...nonLocalizedFields }: any, // TODO
  modelEnumerations: ModelEnumerationsType,
  options: OptionsType,
  ): [any[],any[]] => { // TODO
  const filteredLocales = localizations?.reduce((locales: any, { locale, ...localizedFields }: {locale: string, localizedFields: any}) => {
    const fields = parseFields(localizedFields, modelEnumerations, options);
    return fields.length
      ? [...locales, { locale, fields }]
      : locales;
  }, []);

  const filteredNonLocalizedFields = parseFields(nonLocalizedFields, modelEnumerations, options);

  return [
    filteredLocales || [],
    filteredNonLocalizedFields || [],
  ];
};

const parseInstance = (
  name: string,
  { id, ...instance }: InstanceType,
  defaultLocale: string,
  modelEnumerations: ModelEnumerationsType,
  options: OptionsType,
): string | null => {
  const [localizedFields, nonLocalizedFields] = triageFields(instance, modelEnumerations, options);
  const defaultLocaleFields = localizedFields.filter(({ locale }: { locale: string }) => locale === defaultLocale)[0];

  if (localizedFields.length > 0 || nonLocalizedFields.length > 0) {
    const instanceMutation = interpolateInstance(
      name,
      id,
      localizedFields,
      defaultLocale,
      defaultLocaleFields,
      nonLocalizedFields,
      options,
    );
    return instanceMutation;
  }
  return null;
};

const generateContentMutations = (
  data: any, // TODO
  { defaultLocale, enumerations }: MetaType,
  options: OptionsType
): string[] | [] => {
  console.log('… Generating mutations…');

  const contentMutations = data.reduce((parsedModels: any[], model: ModelType) => {
    const [name, instances] = Object.entries(model)[0];

    if (options.exclude.model[name]) return parsedModels;

    const instanceMutation = instances.reduce((parsedInstances: string[] | [], instance: InstanceType) => {
      const parsedInstance = parseInstance(name, instance, defaultLocale, enumerations[name], options);

      return parsedInstance ? [...parsedInstances, parsedInstance] : parsedInstances;
    }, []);

    return instanceMutation
      ? [...parsedModels, ...instanceMutation]
      : parsedModels;
  }, []);

  return contentMutations;
};

export default generateContentMutations;
