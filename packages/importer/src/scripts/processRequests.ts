/* eslint-disable no-await-in-loop */
import { GraphQLClient } from 'graphql-request';
import type { RequestResultsType, RequestVariablesType } from '../@types/global';

const processRequests = async (
  operations: string[] | string,
  endpoint: string,
  variables?: RequestVariablesType,
): Promise<RequestResultsType | null> => {
  console.log('… Executing requests…');

  if (typeof operations === 'string') operations = [operations];

  try {
    let allOperations: string[] = operations;
    const results: RequestResultsType = { fulfilled:[], rejected:[] };
    let index = 1;

    while (allOperations.length > 0) {

      const batchedClients: Promise<unknown>[] = allOperations
        .slice(0, global.config.options.concurrency)
        .map((request) => {
          const client = new GraphQLClient(endpoint, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${global.config.environment.permanentAccessToken}`,
            },
          });
          return client.request(request, variables);
        });

      const result = await Promise.allSettled(batchedClients);

      if (result.some(res => res.status === 'fulfilled')) {
        results.fulfilled = [...results.fulfilled, ...result.filter(res => res.status === "fulfilled").map(({value}: any) => value)];
      }

      if (result.some(res => res.status === 'rejected')) {
        results.rejected = [...results.rejected, ...result.filter(res => res.status === "rejected")];
      }

      allOperations = allOperations.slice(global.config.options.concurrency);

      console.log(`… Processing request #${index} of ${operations.length}, ${allOperations.length} remaining…`);

      index += global.config.options.concurrency;
    }
    console.log(`\tSuccessfully executed ${operations.length} requests`);
    return results;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default processRequests;
