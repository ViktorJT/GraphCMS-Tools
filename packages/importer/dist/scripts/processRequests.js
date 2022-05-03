import { GraphQLClient } from 'graphql-request';
const processRequests = async (spinner, operations) => {
    try {
        let allOperations = [...operations];
        const results = { fulfilled: [], rejected: [] };
        while (allOperations.length > 0) {
            const batchedClients = allOperations.slice(0, global.config.concurrency).map((request) => {
                const client = new GraphQLClient(global.config.contentApi, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${global.config.permanentAccessToken}`,
                    },
                });
                return client.request(request);
            });
            const result = await Promise.allSettled(batchedClients);
            if (result.some((res) => res.status === 'fulfilled')) {
                const fulfilledRequests = result
                    .filter((req) => req.status === 'fulfilled')
                    .map((req) => req.value);
                if (fulfilledRequests.length !== 0)
                    results.fulfilled.push(...fulfilledRequests);
            }
            if (result.some((res) => res.status === 'rejected')) {
                const rejectedRequests = result.filter((req) => req.status === 'rejected');
                if (rejectedRequests.length !== 0)
                    results.rejected.push(...rejectedRequests);
            }
            if (operations.length !== 1) {
                const percentageDone = Math.ceil(((operations.length - allOperations.length) / operations.length) * 100);
                spinner.text = `Importing content – ${percentageDone}%`;
            }
            allOperations = allOperations.slice(global.config.concurrency);
        }
        return results;
    }
    catch (e) {
        console.error(e);
        throw Error('Something went wrong.');
    }
};
export default processRequests;
