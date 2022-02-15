import exportSchema from './scripts/exportSchema';
import generateQueries from './scripts/generateQueries';
import processRequests from './scripts/processRequests';

async function main() {
  const schema = await exportSchema();
  const queries = generateQueries(schema);
  return processRequests(queries, 'content');
}

export default main;
