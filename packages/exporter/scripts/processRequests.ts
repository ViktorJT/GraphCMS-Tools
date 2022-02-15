/* eslint-disable no-await-in-loop */
import { GraphQLClient } from 'graphql-request';
import config from '../config';

interface Variables {
  projectId: string;
  targetEnvironment: string;
  includeSystemModels?: boolean;
  includeSystemFields?: boolean;
  includeHiddenFields?: boolean;
  includeApiOnlyFields?: boolean;
}

const assertTarget = (name: string): string => {
  if (!process.env.GRAPHCMS_CONTENT_API) throw new Error('Please provide a valid content api url')
  switch (name) {
    case 'management':
      return 'https://management-next.graphcms.com/graphql';
    default:
      return process.env.GRAPHCMS_CONTENT_API;
  }
};

const processRequests = async (operations: string[] | string, api: string, variables?: Variables): Promise<any> => {
  console.log('… Executing requests…');

  if (typeof operations === 'string') operations = [operations];

  const targetApi = assertTarget(api);

  try {
    let allOperations: string[] = operations;
    let results: string[] | [] = [];
    let index: number = 1;

    while (allOperations.length > 0) {
      const batchedClients: Promise<any>[] = allOperations
        .slice(0, config.concurrency)
        .map((request) => {
          const client = new GraphQLClient(targetApi, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN}`,
            },
          });
          return client.request(request, variables);
        });
      results = [...results, ...await Promise.all(batchedClients)];
      allOperations = allOperations.slice(config.concurrency);
      console.log(`… Processing request #${index} of ${operations.length}, ${allOperations.length} remaining…`);
      index += config.concurrency;
    }
    console.log(`\tSuccessfully executed ${operations.length} requests`);

    return results;
  } catch (e) {
    console.error(e);
  }
};

export default processRequests;
