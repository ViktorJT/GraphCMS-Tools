import { GraphQLClient } from 'graphql-request';
const processRequests = async (operations, endpoint, variables) => {
    console.log('… Executing requests…');
    if (typeof operations === 'string')
        operations = [operations];
    try {
        let allOperations = operations;
        const results = { fulfilled: [], rejected: [] };
        let index = 1;
        while (allOperations.length > 0) {
            const batchedClients = allOperations
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
                results.fulfilled = [...results.fulfilled, ...result.filter(res => res.status === "fulfilled").map(({ value }) => value)];
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
    }
    catch (e) {
        console.error(e);
        return null;
    }
};
export default processRequests;
