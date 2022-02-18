"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable indent */
const fs_1 = require("fs");
const config_1 = require("../../config");
const generatePublishMutations = (contentMutations) => {
    console.log('… Generating mutations…');
    const targetStages = config_1.importConfig.targetStages.reduce((parsedStages, stage) => ({
        ...parsedStages,
        [stage]: [],
    }), {});
    const newLocales = config_1.importConfig.newLocales.map((locale) => ({ locale }));
    const schema = contentMutations.reduce((parsedDocuments, document) => {
        const { id, __typename, documentInStages } = Object.values(document)[0];
        const documentIsNew = documentInStages.length === 0;
        const stages = documentIsNew
            ? { [id]: { ...targetStages } }
            : documentInStages.reduce((parsedStages, { stage, localizations }) => ({
                [id]: {
                    ...parsedStages[id],
                    [stage]: localizations
                        ? [...localizations, ...newLocales].map(({ locale }) => locale)
                        : [],
                },
            }), { [id]: {} }); // ! add targetstages here instead and fill in the new locales?
        return {
            ...parsedDocuments,
            [__typename]: {
                ...parsedDocuments[__typename],
                ...stages,
            },
        };
    }, {});
    // TODO: Refactor this, looks dumb to map and then flatten (as opposed to e.g. reducing)
    const publishMutations = Object.entries(schema)
        .map(([model, modelMutations]) => Object.entries(modelMutations)
        .map(([id, stages]) => Object.entries(stages)
        .map(([stage, locales]) => `
      mutation publish${model} {
        publish${model}(
          where: { id: "${id}" }
          to: [${stage}]
          ${locales.length
        ? `locales: [${locales.map((locale) => locale)}]`
        : ''}
        ) { id }
      }
    `))).flat(2);
    if (config_1.importConfig.export.mutations.publish) {
        (0, fs_1.writeFile)('data/mutations/publish.json', JSON.stringify(publishMutations, null, 4), (error) => {
            if (error) {
                console.error(`\t${error}`);
                throw new Error('\tError writing data file to system');
            }
            console.log(`\tSuccessfully exported ${publishMutations.length} mutations to '/data/mutations/publish.json'`);
        });
    }
    return { publishMutations };
};
exports.default = generatePublishMutations;
