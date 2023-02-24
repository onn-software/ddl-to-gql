import fs from 'fs';
import {ResolverGenerator} from './resolver-generator';
import {TableDef} from '../model';

describe('ResolverGenerator', () => {
  it('generates repo', async () => {
    const tableDefsRaw = fs.readFileSync('./temp/interpreted-ddl.json', 'utf-8');
    const tableDefs: TableDef[] = JSON.parse(tableDefsRaw);
    const repo = new ResolverGenerator().execute(tableDefs);

    fs.writeFileSync(`./test/resolvers.ts`, repo);
  });
});
