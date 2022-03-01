/* eslint-disable indent */
import type { ParsedStagesType, ContentMutationsType, DocumentInStagesType, TargetStagesType } from '../@types/global';

const generatePublishMutations = (contentResults: ContentMutationsType[]): string[] => {
  console.log('… Generating mutations…');

  const targetStages = global.config.options.targetStages.reduce((parsedStages: ParsedStagesType, stage: string) => ({
      ...parsedStages,
      [stage]: [],
    }), {});

  const newLocales = global.config.options.newLocales.map((locale: string) => ({ locale }));

  const schema = contentResults.reduce((parsedDocuments: ContentMutationsType, document: ContentMutationsType) => {
    const { id, __typename, documentInStages } = Object.values(document)[0];
    const documentIsNew = documentInStages.length === 0;

    const stages = documentIsNew
      ? { [id]: { ...targetStages } }
      : documentInStages.reduce((parsedStages: TargetStagesType, { stage, localizations }: DocumentInStagesType) => ({
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
