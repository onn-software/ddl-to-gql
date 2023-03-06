import fs from 'fs';
import {SchemaGenerator} from './schema-generator';
import {TableDef} from '../model';
import {Executor} from '../executor';

describe('SchemaGenerator', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] = require('../../test/spec/interpreted-ddl.json');
    const heuristic: TableDef[] = require('../../test/spec/heuristic.json');
    const repo = new SchemaGenerator().execute(Object.values(Executor.mergeTableDefs(tableDefs, heuristic)));

    fs.writeFileSync(`./test/spec/schema.graphql`, repo);
  });
});
