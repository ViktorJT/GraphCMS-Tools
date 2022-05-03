export const generateMetadata = (schema) => {
    const { models, locales } = schema.viewer.project.environment.contentModel;
    const defaultLocale = locales.find((locale) => locale.isDefault)?.apiId;
    if (!defaultLocale)
        throw Error('No default locale found, please check your GraphCMS settings');
    const enumerations = models.reduce((parsedModels, { apiId: modelApiId, fields }) => {
        const enumerableFields = fields.filter((field) => field.enumeration);
        if (!enumerableFields.length)
            return parsedModels;
        const modelEnums = enumerableFields.reduce((parsedFields, { apiId: fieldApiId, enumeration }) => {
            if (!enumeration)
                return parsedFields;
            if (parsedFields[fieldApiId])
                return parsedFields;
            const enumValues = enumeration.values.map(({ apiId }) => apiId);
            return { ...parsedFields, [fieldApiId]: enumValues };
        }, {});
        return { ...parsedModels, [modelApiId]: { ...modelEnums } };
    }, {});
    return {
        locales,
        enumerations,
        defaultLocale,
    };
};
export default generateMetadata;
