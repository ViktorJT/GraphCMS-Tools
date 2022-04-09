import { writeFileSync } from 'fs';
const lowerCaseFirstLetter = (string) => string.charAt(0).toLowerCase() + string.slice(1);
const triage = (apiId, options, isSystem) => {
    if (apiId === 'id')
        return true;
    if (options.exclude.field[apiId])
        return false;
    if (options.exclude.model[apiId])
        return false;
    if (options.include.includeSystemFields === false && isSystem)
        return false;
    return true;
};
const assertLocalization = (fields, modelIsLocalized) => (modelIsLocalized
    ? fields.reduce((separatedFields, field) => (field.isLocalized
        ? [[...separatedFields[0]], [...separatedFields[1], field]]
        : [[...separatedFields[0], field], [...separatedFields[1]]]), [[], []])
    : [fields, null]);
const assertFieldSubType = (apiId, options, type) => {
    if (type && options.exclude.subType[type])
        return ' ';
    switch (type) {
        case 'RICHTEXT': return `${apiId} { raw }`;
        case 'LOCATION': return `${apiId} { latitude\nlongitude }`;
        case 'COLOR': return `${apiId} { hex }`;
        default: return `${apiId}`;
    }
};
const assertFieldType = ({ apiId, __typename, ...field }, options) => {
    if (options.exclude.type[__typename])
        return ' ';
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
const parseFields = (fields, options) => fields.reduce((parsedFields, field) => (triage(field.apiId, options, field.isSystem)
    ? [...parsedFields, assertFieldType(field, options)]
    : parsedFields), []);
const generateQueries = (schema, options) => {
    console.log('… Generating queries…');
    const contentQueries = schema.reduce((parsedQueries, { apiId: modelApiId, apiIdPlural: modelApiIdPlural, isLocalized: modelIsLocalized, fields: modelFields, }) => {
        const [nonLocalizedFields, localizedFields] = assertLocalization(modelFields, modelIsLocalized);
        return triage(modelApiId, options)
            ? [...parsedQueries, `query ${modelApiId} {
          ${modelApiId}: ${lowerCaseFirstLetter(modelApiIdPlural)}(
              stage: ${options.targetContentStage}
              first: 1000
            ) {
            ${modelIsLocalized
                    ? `localizations(${options.targetLocales.length
                        ? `locales: [${options.targetLocales}]`
                        : ''}) {
                  locale
                  ${localizedFields !== null && parseFields(localizedFields, options)}
                }
                ${nonLocalizedFields !== null && parseFields(nonLocalizedFields, options)}\n}`
                    : `${nonLocalizedFields !== null && parseFields(nonLocalizedFields, options)}\n}`}
          }
        `]
            : parsedQueries;
    }, []);
    writeFileSync('test.json', JSON.stringify(contentQueries, null, 2));
    console.log(`\tSuccessfully generated ${contentQueries.length} queries`);
    return contentQueries;
};
export default generateQueries;
