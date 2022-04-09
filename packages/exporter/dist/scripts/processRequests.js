import { GraphQLClient } from 'graphql-request';
const processRequests = async (operations, endpoint, config, variables) => {
    console.log('… Executing requests…');
    let allOperations = Array.isArray(operations)
        ? operations
        : [operations];
    try {
        let results = [];
        let index = 1;
        while (allOperations.length > 0) {
            const batchedClients = allOperations
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
    }
    catch (e) {
        console.error(e);
    }
    return false;
};
export default processRequests;
