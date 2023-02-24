import fs from 'fs';
import {RepoGenerator} from './repo-generator';
import {TableDef} from '../model';

describe('RepoGenerator', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] =  require('../../test/spec/interpreted-ddl.json');
    const repo = new RepoGenerator().execute(tableDefs);

    fs.writeFileSync(`./test/spec/repos.ts`, repo);
  });
});
