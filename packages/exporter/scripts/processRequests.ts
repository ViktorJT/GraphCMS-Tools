/* eslint-disable no-await-in-loop */
import { GraphQLClient } from 'graphql-request';

interface ConfigType {
  concurrency: number;
  permanentAccessToken: string;
}

interface VariablesType {
  projectId?: string;
  targetEnvironment?: string;
  includeSystemModels?: boolean;
  includeSystemFields?: boolean;
  includeHiddenFields?: boolean;
  includeApiOnlyFields?: boolean;
}
const processRequests = async (
  operations: string[] | string,
  endpoint: string,
  config: ConfigType,
  variables?: VariablesType,
): Promise<any> => {
  console.log('… Executing requests…');

  let allOperations = Array.isArray(operations)
    ? operations
    : [operations];

  try {
    let results: string[] | [] = [];
    let index: number = 1;

    while (allOperations.length > 0) {
      const batchedClients: Promise<any>[] = allOperations
        .slice(0, config.concurrency)
        .map((request) => {
          const client = new GraphQLClient(endpoint, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.permanentAccessToken}`,
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
  return false;
};

export default processRequests;
