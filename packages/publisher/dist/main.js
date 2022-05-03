// * generatePublishMutations.ts
// TODO: Refactor the dumb flatmap thing, reduce instead?
// TODO: add targetstages in reduce initializer of stages variable instead, and fill in the new locales then?
// TODO: Refactor newLocales logic (same as prev. point about target stages?)
import ora from 'ora';
import generatePublishMutations from './scripts/generatePublishMutations.js';
import processRequests from './scripts/processRequests.js';
export async function publishData(data, environment, options = {
    concurrency: 3,
}) {
    const publishMutations = generatePublishMutations(data);
    if (!publishMutations || publishMutations.length === 0)
        throw Error('Something went wrong');
    const spinner = ora({ text: 'Publishing content – 0%', spinner: 'clock' }).start();
    const publishResults = await processRequests(spinner, publishMutations, {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        targetEnvironment: /\w+$/g.exec(environment.contentApi)[0],
        ...environment,
        ...options,
    });
    if (publishResults.fulfilled.length === 0) {
        spinner.fail('Publishing content failed');
    }
    else if (publishResults.fulfilled.length && publishResults.rejected.length) {
        spinner.warn(`Partially published content, ${publishResults.rejected.length} documents rejected`);
    }
    else {
        spinner.succeed('Successfully published content');
    }
    return [publishResults.fulfilled, publishResults.rejected];
}
export default publishData;
