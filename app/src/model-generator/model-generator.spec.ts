import fs from 'fs';
import {ModelGenerator} from './model-generator';
import {TableDef} from '../model';

describe('ModelGenerator', () => {
  it('generates model', async () => {
    const tableDefs: TableDef[] =  require('../../temp/interpreted-ddl.json');
    const model = new ModelGenerator().execute(tableDefs);

    fs.writeFileSync(`./temp/model.ts`, model);
  });
});
