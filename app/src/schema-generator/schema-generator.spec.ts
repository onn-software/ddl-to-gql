import fs from 'fs';
import {SchemaGenerator} from './schema-generator';
import {TableDef} from '../model';

describe('SchemaGenerator', () => {
  it('generates repo', async () => {
    const tableDefsRaw = fs.readFileSync('./temp/interpreted-ddl.json', 'utf-8');
    const tableDefs: TableDef[] = JSON.parse(tableDefsRaw);
    const repo = new SchemaGenerator().execute(tableDefs);

    fs.writeFileSync(`./test/schema.graphql`, repo);
  });
});
