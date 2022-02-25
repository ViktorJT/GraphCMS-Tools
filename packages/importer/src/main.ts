// * Main.ts
// TODO: Replace JSON data input with 'regular' props

// * GenerateConfig.ts
// ! TODO: Fix TypeScript errors

// * ProcessRequests.ts
// ! TODO: Fix TypeScript errors
// TODO: Refactor fulfilled / rejected requests logic

// * generateContentMutations.ts
// ! TODO: Refactor 'any' types
// TODO: Make a variable for hasLocalizedFields or hasNonLocalizedFields to not have to check length everywhere
// TODO: Filter the localizedFields for en locale before this step, like I do for defaultLocaleFields?
// TODO: Add options for 'mode' apart from 'Upsert'
// TODO: (InterpolateInstance)
         // TODO: Create assumeType function to make code more readable?
         // TODO: Make a helper wrapper function that can handle reference fields with 'connect:'
// TODO: (ParseFields)
         // TODO: Make an assumeType function that just returns a string corresponding to a __typename or type
         // TODO: Find better way to identify fields that need to be wrapped
         // TODO: Create & check validations against metadata?

// * generatePublishMutations.ts
// TODO: Refactor the dumb flatmap thing, reduce instead?
// TODO: add targetstages in reduce initializer of stages variable instead, and fill in the new locales then?
// TODO: Refactor newLocales logic (same as prev. point about target stages?)


// * global.d.ts
// TODO: Check which need to be exported / not

import testData from '../data/test.json';
import generateConfig from './scripts/generateConfig';
import generateContentMutations from './scripts/generateContentMutations';
import generatePublishMutations from './scripts/generatePublishMutations';
import processRequests from './scripts/processRequests';
import type { ModelType, EnvironmentType, OptionsType } from "./@types/global"

async function importData(
  data: ModelType[],
  environment: EnvironmentType,
  options: OptionsType = {
    concurrency: 1,
    newLocales: ['et', 'hr', 'lt', 'lv', 'ru', 'sk', 'sl', 'sr'],
    targetStages: ['QA', 'PUBLISHED'],
    mode: 'upsert',
    exclude: {
      model: {
        User: true, // ! Required
      },
      field: {
        createdBy: true, // ! Required
        updatedBy: true, // ! Required
      },
    },
  },
) {

  global.config = await generateConfig(environment, options);
  Object.freeze(global.config);

  const contentMutations = generateContentMutations(data);
  const contentResults = await processRequests(contentMutations, global.config.environment.contentApi);

  if (!contentResults) throw new Error('Something went wrong');

  const publishMutations = generatePublishMutations(contentResults.fulfilled);

  const results = await processRequests(
    publishMutations,
    environment.contentApi,
  );

  return results; // TODO Make it so ALL successful and REJECTED requests are returned
}

importData(
  testData, // ? Probably fine to leave this since I won't be loading JSON data later
  {
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
  },
);

export default importData;
