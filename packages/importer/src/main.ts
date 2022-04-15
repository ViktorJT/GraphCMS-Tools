// * generateContentMutations.ts
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
// TODO: Refactor exlude list to be an array of keys to exclude?

import ora from 'ora';

import exportSchema from './scripts/exportSchema.js';
import generateMetadata from './scripts/generateMetadata.js';
import setGlobalConfig from './scripts/setGlobalConfig.js';
import generateContentMutations from './scripts/generateContentMutations.js';
import processRequests from './scripts/processRequests.js';

import schemaQuery from './queries/schemaQuery.js';

import type {DataType, EnvironmentType, OptionsType} from './types/index.js';

export async function importData(
  data: DataType[],
  environment: EnvironmentType,
  options: OptionsType = {
    concurrency: 3,
    exclude: {
      model: {
        User: true, // ! Required
      },
      field: {
        createdBy: true, // ! Required
        updatedBy: true, // ! Required
      },
    },
  }
) {
  const metadataSpinner = ora({text: 'Creating config…', spinner: 'clock'}).start();

  const schema = await exportSchema(schemaQuery, {
    permanentAccessToken: environment.permanentAccessToken,
    projectId: environment.projectId,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    targetEnvironment: /\w+$/g.exec(environment.contentApi)![0],
  });

  const metadata = generateMetadata(schema);

  setGlobalConfig(environment, options, metadata);

  if (!schema) {
    metadataSpinner.fail('Creating config failed');
    throw Error('Something went wrong!');
  } else {
    metadataSpinner.succeed('Successfully created config');
  }

  const contentMutations = generateContentMutations(data);

  const importSpinner = ora({text: 'Importing content – 0%', spinner: 'clock'}).start();

  const contentResults = await processRequests(importSpinner, contentMutations);

  if (contentResults.fulfilled.length === 0) {
    importSpinner.fail('Imported content failed');
  } else {
    importSpinner.succeed('Successfully imported content');
  }

  return [contentResults.fulfilled, contentResults.rejected];
}

export default importData;
