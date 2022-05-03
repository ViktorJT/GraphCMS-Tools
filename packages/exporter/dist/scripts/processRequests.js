/* eslint-disable no-await-in-loop */
import { GraphQLClient } from 'graphql-request';
const processRequests = async (spinner, operations, endpoint, variables) => {
    try {
        let allOperations = [...operations];
        const operationResults = [];
        while (allOperations.length > 0) {
            const batchedClients = allOperations.slice(0, global.config.concurrency).map((request) => {
                const client = new GraphQLClient(endpoint, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${global.config.permanentAccessToken}`,
                    },
                });
                return client.request(request, variables);
            });
            const result = await Promise.all(batchedClients);
            operationResults.push(...result);
            allOperations = allOperations.slice(global.config.concurrency);
            if (operations.length !== 1) {
                const percentageDone = Math.ceil(((operations.length - allOperations.length) / operations.length) * 100);
                spinner.text = `Exporting content – ${percentageDone}%`;
            }
        }
        return operationResults;
    }
    catch (e) {
        throw Error('Something went wrong while processing requests');
    }
};
export default processRequests;
