import fs from 'fs';
import {SchemaGenerator} from './schema-generator';
import {TableDef} from '../model';

describe('SchemaGenerator', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] =  require('../../test/spec/interpreted-ddl.json');
    const repo = new SchemaGenerator().execute(tableDefs);

    fs.writeFileSync(`./test/spec/schema.graphql`, repo);
  });
});
