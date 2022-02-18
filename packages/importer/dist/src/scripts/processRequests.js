"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-await-in-loop */
const graphql_request_1 = require("graphql-request");
const processRequests = async (operations, endpoint, config, variables) => {
    console.log('… Executing requests…');
    if (typeof operations === 'string')
        operations = [operations];
    try {
        let allOperations = operations;
        let results = [];
        let index = 1;
        while (allOperations.length > 0) {
            const batchedClients = allOperations
                .slice(0, config.concurrency)
                .map((request) => {
                const client = new graphql_request_1.GraphQLClient(endpoint, {
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
};
exports.default = processRequests;
