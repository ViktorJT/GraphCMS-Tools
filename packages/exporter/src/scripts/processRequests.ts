/* eslint-disable no-await-in-loop */
import {GraphQLClient} from 'graphql-request';
import type {RequestResultsType, RequestVariablesType} from '../types';

const processRequests = async (
  operations: string[] | string,
  endpoint: string,
  variables?: RequestVariablesType
): Promise<RequestResultsType> => {
  console.log('… Processing requests…');

  console.log(variables);

  if (typeof operations === 'string') operations = [operations];

  try {
    let allOperations = operations;
    const results: RequestResultsType = {fulfilled: [], rejected: []};
    let index = 1;

    while (allOperations.length > 0) {
      const batchedClients: Promise<unknown>[] = allOperations
        .slice(0, global.config.concurrency)
        .map((request) => {
          const client = new GraphQLClient(endpoint, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${global.config.permanentAccessToken}`,
            },
          });
          return client.request(request, variables);
        });

      // deconstruct here instead of array mehtods and stuff below??
      const result = await Promise.allSettled(batchedClients);

      if (result.some((res) => res.status === 'fulfilled')) {
        results.fulfilled = result
          .filter((res) => res.status === 'fulfilled')
          .map(({value}: any) => value);
      }

      if (result.some((res) => res.status === 'rejected')) {
        results.rejected = result.filter((res) => res.status === 'rejected');
      }

      allOperations = allOperations.slice(global.config.concurrency);

      console.log(
        `… Processing request #${index} of ${operations.length}, ${allOperations.length} remaining…`
      );

      index += global.config.concurrency;
    }
    console.log(`\t${operations.length} requests processed`);
    return results;
  } catch (e) {
    throw new Error('Something went wrong while processing requests');
  }
};

export default processRequests;
