import fs from 'fs';
import {RepoGenerator} from './repo-generator';
import {TableDef} from '../model';

describe('RepoGenerator', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] =  require('../../temp/interpreted-ddl.json');
    const repo = new RepoGenerator().execute(tableDefs);

    fs.writeFileSync(`./temp/repos.ts`, repo);
  });
});
