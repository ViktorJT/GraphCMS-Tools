"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable indent */
const graphql_request_1 = require("graphql-request");
const stringify_object_1 = __importDefault(require("stringify-object"));
// TODO Make a variable for hasLocalizedFields or hasNonLocalizedFields to not have to check length everywhere
// TODO FIlter the localizedFields for en locale before this step, like I do for defaultLocaleFields?
const interpolateInstance = (name, id, localizedFields, // TODO
defaultLocale, defaultLocaleFields, // TODO
nonLocalizedFields, // TODO
options) => (0, graphql_request_1.gql) `
mutation ${options.mode}${name} {
  ${options.mode}${name}(
    where: { id: "${id}" }
    upsert: {
      create: {
        ${localizedFields.length
    ? `localizations: {
              create: [
                ${localizedFields.filter(({ locale }) => locale !== defaultLocale).map(({ locale, fields }) => `
                  { locale: ${locale} data: { ${fields.join('\n')} } }
                `).join('\n')}
              ]}
              ${defaultLocaleFields?.fields || ''}`
    : ''}
        ${nonLocalizedFields.length
    ? nonLocalizedFields.map((field) => (field.create ? field.create : field)).join('\n')
    : ''}
      }
      update: {
        ${localizedFields.length
    ? `localizations: {
            upsert: [
              ${localizedFields.map(({ locale, fields }) => `
                { locale: ${locale} create: { ${fields.join('\n')} } update: { ${fields.join('\n')} } }
              `).join('\n')}
            ]}`
    : ''}
        ${nonLocalizedFields.length
    ? nonLocalizedFields.map((field) => (field.update ? field.update : field)).join('\n')
    : ''}
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
const parseFields = (fields, // TODO
enumerations, options) => Object.entries(fields)
    .filter(([key, value]) => {
    // TODO check validations against metadata?
    if (options.exclude.field[key])
        return false;
    if (typeof value !== 'boolean' && !value)
        return false;
    if (Array.isArray(value) && !value.length)
        return false;
    return true;
})
    .map(([key, value]) => {
    // TODO: Make an assumeType function that just returns a string corresponding to a __typename or type
    // TODO: Find better way to identify fields that need to be wrapped
    if (key === 'createdAt' || key === 'updatedAt')
        return { create: `${key}: "${value}"`, update: ' ' };
    if (value?.id) {
        return value?.__typename
            ? `${key}: { connect: { ${value.__typename}: { id: "${value.id}" }} }`
            : `${key}: { connect: { id: "${value.id}" } }`;
    }
    if (value?.longitude || value?.latitude || value?.hex || value?.raw) {
        return `${key}: ${(0, stringify_object_1.default)(value.raw ? value.raw : value, { singleQuotes: false })}`;
    }
    if (enumerations && enumerations[key]) {
        return Array.isArray(value)
            ? `${key}: [${value}]`
            : `${key}: ${value}`;
    }
    if (Array.isArray(value)) {
        if (typeof value[0] === 'string')
            return `${key}: [${value.map((item) => `${JSON.stringify(item)}`)}]`;
        if (typeof value[0] === 'number')
            return value.map((itemValue) => `${key}: ${itemValue}`);
        if (value[0].id) {
            return value[0].__typename
                ? {
                    create: `${key}: { connect: ${(0, stringify_object_1.default)(value.map(({ __typename, ...item }) => ({ [__typename]: { ...item } })), { singleQuotes: false })}}`,
                    update: `${key}: { connect: ${(0, stringify_object_1.default)(value.map(({ __typename, ...item }) => ({ [__typename]: { where: { ...item } } })), { singleQuotes: false })}}`,
                }
                : {
                    create: `${key}: { connect: ${(0, stringify_object_1.default)(value.map((item) => item), { singleQuotes: false })}}`,
                    update: `${key}: { connect: ${(0, stringify_object_1.default)(value.map((item) => ({ where: item })), { singleQuotes: false })}}`,
                };
        }
    }
    if (typeof value === 'number' || typeof value === 'boolean')
        return `${key}: ${value}`;
    return `${key}: ${JSON.stringify(value)}`;
});
const triageFields = ({ localizations, ...nonLocalizedFields }, // TODO
modelEnumerations, options) => {
    const filteredLocales = localizations?.reduce((locales, { locale, ...localizedFields }) => {
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
const parseInstance = (name, { id, ...instance }, defaultLocale, modelEnumerations, options) => {
    const [localizedFields, nonLocalizedFields] = triageFields(instance, modelEnumerations, options);
    const defaultLocaleFields = localizedFields.filter(({ locale }) => locale === defaultLocale)[0];
    if (localizedFields.length > 0 || nonLocalizedFields.length > 0) {
        const instanceMutation = interpolateInstance(name, id, localizedFields, defaultLocale, defaultLocaleFields, nonLocalizedFields, options);
        return instanceMutation;
    }
    return null;
};
const generateContentMutations = (data, // TODO
{ defaultLocale, enumerations }, options) => {
    console.log('… Generating mutations…');
    const contentMutations = data.reduce((parsedModels, model) => {
        const [name, instances] = Object.entries(model)[0];
        if (options.exclude.model[name])
            return parsedModels;
        const instanceMutation = instances.reduce((parsedInstances, instance) => {
            const parsedInstance = parseInstance(name, instance, defaultLocale, enumerations[name], options);
            return parsedInstance ? [...parsedInstances, parsedInstance] : parsedInstances;
        }, []);
        return instanceMutation
            ? [...parsedModels, ...instanceMutation]
            : parsedModels;
    }, []);
    return contentMutations;
};
exports.default = generateContentMutations;
