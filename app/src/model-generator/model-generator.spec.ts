import fs from 'fs';
import {ModelGenerator} from './model-generator';
import {TableDef} from '../model';

describe('ModelGenerator', () => {
  it('generates model', async () => {
    const tableDefs: TableDef[] =  require('../../test/spec/interpreted-ddl.json');
    const model = new ModelGenerator().execute(tableDefs);

    fs.writeFileSync(`./test/spec/model.ts`, model);
  });
});
