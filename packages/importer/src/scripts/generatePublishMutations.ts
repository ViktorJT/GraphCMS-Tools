/* eslint-disable indent */
import { writeFile } from 'fs';
import { OptionsType } from '../main';
// import { importConfig } from '../../config';

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

const generatePublishMutations = (contentMutations: ContentMutationsType[], options: OptionsType) => {
  console.log('… Generating mutations…');

  const targetStages = options.targetStages.reduce((parsedStages, stage) => ({
      ...parsedStages,
      [stage]: [],
    }), {});

    const newLocales = options.newLocales.map((locale) => ({ locale }));

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
            ? `locales: [${locales.map((locale: string) => locale)}]`
            : ''
          }
        ) { id }
      }
    `))).flat(2);

  return publishMutations;
};

export default generatePublishMutations;
