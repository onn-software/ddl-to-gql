import fs from 'fs';
import { ModelGenerator } from './model-generator';
import { TableDef } from '../model';
import { associateBy } from '../util';
import {Executor} from '../executor';

describe('ModelGenerator', () => {
  it('generates model', async () => {
    const tableDefs: TableDef[] = require('../../test/spec/interpreted-ddl.json');
    const heuristic: TableDef[] = require('../../test/spec/heuristic.json');

    const model = new ModelGenerator().execute(Object.values(Executor.mergeTableDefs(tableDefs, heuristic)));

    fs.writeFileSync(`./test/spec/model.ts`, model);
  });
});
