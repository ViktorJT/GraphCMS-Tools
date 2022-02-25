/* eslint-disable indent */
interface DocumentInStagesType {
  stage: string;
  localizations?: {locale: string}[];
}

interface ContentMutationsType {
  [key: string]: {
    id: string;
    __typename: string;
    documentInStages: DocumentInStagesType[];
  }
}

const generatePublishMutations = (contentMutations: ContentMutationsType[]) => {
  console.log('… Generating mutations…');

  const targetStages = global.config.options.targetStages.reduce((parsedStages: string[], stage: string) => ({
      ...parsedStages,
      [stage]: [],
    }), {});

    const newLocales = global.config.options.newLocales.map((locale: string[]) => ({ locale }));

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
          }), { [id]: {} });

    return {
      ...parsedDocuments,
      [__typename]: {
        ...parsedDocuments[__typename],
        ...stages,
      },
    };
  }, {});


  const publishMutations = Object.entries(schema)
    .map(([model, modelMutations]) => Object.entries(modelMutations)
    .map(([id, stages]) => Object.entries(stages)
    .map(([stage, locales]) => `
      mutation publish${model} {
        publish${model}(
          where: { id: "${id}" }
          to: [${stage}]
          ${locales.length
            ? `locales: [${locales.map((locale: string) => locale)}]`
            : ''
          }
        ) { id }
      }
    `))).flat(2);

  return publishMutations;
};

export default generatePublishMutations;
