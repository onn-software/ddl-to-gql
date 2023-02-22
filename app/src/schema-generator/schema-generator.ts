import { TableDef } from '../model';
import { Globals } from '../globals';
import { baseGql, GqlTypeMap } from './schema-generator.templates';

export class SchemaGenerator {
  execute(tableDefs: TableDef[]): string {
    const gqlSchema = tableDefs.map((table) => this.generateGqlSchema(table));
    return baseGql + gqlSchema.join('\n');
  }

  generateGqlSchema(tableDef: TableDef): string {
    const interfaceName = Globals.getGqlName(tableDef.tableName);
    const schema = [`type ${interfaceName} {`];

    tableDef.columns.forEach((c) => {
      schema.push(
        `  ${c.key}: ${GqlTypeMap[c.sqlType.split('(')[0].toUpperCase()] ?? 'String'}${
          c.nullable ? '' : '!'
        }`
      );
    });

    if (tableDef.relations.length > 0) {
      schema.push('');
      schema.push('  # Relations');

      tableDef.relations.forEach((r) => {
        const type = Globals.getGqlName(r.to.table);
        if (r.many) {
          const key = Globals.composeToRelationKey(r);
          schema.push(`  ${key}(paginate: Paginate): Paginated${type}`);
        } else {
          const key = Globals.composeToRelationKey(r);
          schema.push(`  ${key}: ${type}`);
        }
      });
    }
    schema.push('}');
    schema.push('');

    schema.push(`type Paginated${interfaceName} {`);
    schema.push('  pageIndex: Int!');
    schema.push('  pageSize: Int!');
    schema.push('  totalEntries: Int!');
    schema.push(`  data: [${interfaceName}!]!`);
    schema.push('}');
    schema.push('');

    return schema.join('\n');
  }
}
