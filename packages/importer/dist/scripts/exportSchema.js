/* eslint-disable no-await-in-loop */
import { GraphQLClient } from 'graphql-request';
const exportSchema = async (operations, variables) => {
    try {
        if (!variables)
            throw Error();
        const { permanentAccessToken, ...rest } = variables;
        const client = new GraphQLClient('https://management-next.graphcms.com/graphql', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${permanentAccessToken}`,
            },
        });
        return client.request(operations, rest);
    }
    catch (e) {
        console.error(e);
        throw Error('Unable to connect to GraphCMS, please check your environment variables');
    }
};
export default exportSchema;
