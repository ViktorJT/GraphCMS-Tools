/* eslint-disable indent */
import type {DataType} from '../types/index.js';

export const generatePublishMutations = (contentResults: DataType[]): string[] => {
  const publishMetadata = contentResults.reduce((parsedDocuments, document) => {
    const {id, __typename, documentInStages} = Object.values(document)[0];

    if (publishConfig.exclude.model[__typename]) return parsedDocuments;

    const stages = documentInStages.reduce(
      (parsedStages, {stage, localizations}) => ({
        [id]: {
          ...parsedStages[id],
          [stage]: localizations ? [...localizations].map(({locale}) => locale) : [],
        },
      }),
      {[id]: {}}
    );

    return {
      ...parsedDocuments,
      [__typename]: {
        ...parsedDocuments[__typename],
        ...stages,
      },
    };
  }, {});

  const publishMutations = Object.entries(publishMetadata)
    .map(([model, modelMutations]) =>
      Object.entries(modelMutations).map(([id, stages]) =>
        Object.entries(stages).map(
          ([stage, locales]) => `
            mutation publish${model} {
              publish${model}(
                where: { id: "${id}" }
                to: [${stage}]
                ${locales.length ? `locales: [${locales.map((locale: string) => locale)}]` : ''}
              ) { id }
            }
          `
        )
      )
    )
    .flat(2);

  return publishMutations;
};

export default generatePublishMutations;
