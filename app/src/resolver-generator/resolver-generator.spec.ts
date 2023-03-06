import fs from 'fs';
import {ResolverGenerator} from './resolver-generator';
import {TableDef} from '../model';
import {Executor} from '../executor';

describe('ResolverGenerator', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] = require('../../test/spec/interpreted-ddl.json');
    const heuristic: TableDef[] = require('../../test/spec/heuristic.json');
    const repo = new ResolverGenerator().execute(Object.values(Executor.mergeTableDefs(tableDefs, heuristic)));

    fs.writeFileSync(`./test/spec/resolvers.ts`, repo);
  });
});
