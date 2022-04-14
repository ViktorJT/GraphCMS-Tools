/* eslint-disable no-await-in-loop */
import type {Ora} from 'ora';
import {GraphQLClient} from 'graphql-request';

import type {
  RequestResultsType,
  ContentMutationsType,
  RequestVariablesType,
} from '../types/index.js';

const processRequests = async (
  spinner: Ora,
  operations: string[],
  variables: RequestVariablesType
): Promise<RequestResultsType> => {
  try {
    let allOperations = [...operations];
    const results: RequestResultsType = {fulfilled: [], rejected: []};

    while (allOperations.length > 0) {
      const batchedClients = allOperations.slice(0, variables.concurrency).map((request) => {
        const client = new GraphQLClient(variables.contentApi, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${variables.permanentAccessToken}`,
          },
        });
        return client.request(request);
      });

      const result = await Promise.allSettled(batchedClients);

      if (result.some((res) => res.status === 'fulfilled')) {
        results.fulfilled = result
          .filter(
            (res: PromiseSettledResult<PromiseFulfilledResult<ContentMutationsType>>) =>
              res.status === 'fulfilled'
          )
          .map(({value}: any) => value);
      }

      if (result.some((res) => res.status === 'rejected')) {
        results.rejected = result.filter(
          (res: PromiseSettledResult<PromiseRejectedResult>) => res.status === 'rejected'
        );
      }

      if (operations.length !== 1) {
        const percentageDone = Math.ceil(
          ((operations.length - allOperations.length) / operations.length) * 100
        );
        spinner.text = `Publishing content – ${percentageDone}%`;
      }

      allOperations = allOperations.slice(variables.concurrency);
    }

    return results;
  } catch (e) {
    console.error(e);
    throw Error('Something went wrong.');
  }
};

export default processRequests;
