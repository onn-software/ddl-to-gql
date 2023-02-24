import fs from 'fs';
import {ResolverGenerator} from './resolver-generator';
import {TableDef} from '../model';

describe('ResolverGenerator', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] =  require('../../test/spec/interpreted-ddl.json');
    const repo = new ResolverGenerator().execute(tableDefs);

    fs.writeFileSync(`./test/spec/resolvers.ts`, repo);
  });
});
