"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_json_1 = __importDefault(require("./test.json"));
const exportMeta_1 = __importDefault(require("./src/scripts/exportMeta"));
const generateContentMutations_1 = __importDefault(require("./src/scripts/generateContentMutations"));
// interface DataType { // TODO
//   [key: string]: any[];
// }
async function importData(
// data: DataType[], // TODO
data, config, options = {
    concurrency: 1,
    newLocales: ['et', 'hr', 'lt', 'lv', 'ru', 'sk', 'sl', 'sr'],
    // targetStages: ['QA', 'PUBLISHED'], // TODO Add validations from metadata later?
    mode: 'upsert',
    exclude: {
        model: {
            User: true, // ! Required
        },
        field: {
            createdBy: true,
            updatedBy: true, // ! Required
        },
    },
}) {
    const targetEnvironmentRegex = /\w+$/g;
    const matches = targetEnvironmentRegex.exec(config.contentApi);
    if (!matches || !matches.length) {
        throw new Error('Please provide a content api url containing a valid target environment');
    }
    const environment = {
        ...config,
        targetEnvironment: matches[0],
    };
    const { allLocales, enumerations } = await (0, exportMeta_1.default)(environment, options);
    const defaultLocale = allLocales.find((locale) => locale.isDefault);
    if (!defaultLocale)
        throw new Error('No default locale found'); // TODO Is there always a default locale, even if there are no other locales?
    const contentMutations = (0, generateContentMutations_1.default)(data, { defaultLocale: defaultLocale.apiId, enumerations }, options);
    // const contentResults = await processRequests(contentMutations);
    // const publishMutations = generatePublishMutations(contentResults);
    // const results = await processRequests(publishMutations);
    // return results; // TODO Make it so all successful and REJECTED requests are returned
}
if (!process.env.GRAPHCMS_PROJECT_ID)
    throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN)
    throw new Error('Please provide a valid project ID');
if (!process.env.GRAPHCMS_CONTENT_API)
    throw new Error('Please provide a valid content api url');
importData(test_json_1.default, {
    contentApi: process.env.GRAPHCMS_CONTENT_API,
    projectId: process.env.GRAPHCMS_PROJECT_ID,
    permanentAccessToken: process.env.GRAPHCMS_PERMANENT_ACCESS_TOKEN,
});
exports.default = importData;
