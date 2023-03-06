import fs from 'fs';
import {RepoGenerator} from './repo-generator';
import {TableDef} from '../model';
import {Executor} from '../executor';

describe('RepoGenerator', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] = require('../../test/spec/interpreted-ddl.json');
    const heuristic: TableDef[] = require('../../test/spec/heuristic.json');
    const repo = new RepoGenerator().execute(Object.values(Executor.mergeTableDefs(tableDefs, heuristic)));

    fs.writeFileSync(`./test/spec/repos.ts`, repo);
  });
});
