import { TableDef } from '../model';
import { Globals } from '../globals';
import { baseGql, GqlTypeMap } from './schema-generator.templates';

export class SchemaGenerator {
  execute(tableDefs: TableDef[]): string {
    const gqlSchema = tableDefs.map((table) => this.generateGqlSchema(table));
    const gqlQueries = this.generateGqlSchemaQueries(tableDefs);
    const gqlMutations = this.generateGqlSchemaMutations(tableDefs);
    return baseGql + gqlSchema.join('\n') + gqlQueries.join('\n') + gqlMutations.join('\n');
  }

  generateGqlSchema(tableDef: TableDef): string {
    const interfaceName = Globals.getGqlName(tableDef.tableName);

    const queryTypes = this.generateQueryTypes(interfaceName, tableDef);
    const upsertTypes = this.generateUpsertTypes(interfaceName, tableDef);


    return [...queryTypes, ...upsertTypes].join('\n');
  }

  private generateUpsertTypes(interfaceName: string, tableDef: TableDef) {
    const schema = [`input ${interfaceName}_upsert {`];

    tableDef.columns.forEach((c) => {
      schema.push(
          `  ${c.key}: ${GqlTypeMap[c.sqlType.split('(')[0].toUpperCase()] ?? 'String'}`
      );
    });

    schema.push('}');
    schema.push('');

    return schema;
  }

  private generateQueryTypes(interfaceName: string, tableDef: TableDef) {
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
          schema.push(`  ${key}(paginate: Paginate, orderBy: OrderBy, where: [WhereClause!]): Paginated${type}`);
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

    return schema;
  }

  private generateGqlSchemaQueries(tableDefs: TableDef[]) {
    const queries = ['', 'extend type Query {'];
    tableDefs.forEach(table => {
      queries.push(`  ${table.tableName}(paginate: Paginate, orderBy: OrderBy, where: [WhereClause!]): Paginated${Globals.getGqlName(table.tableName)}`);
    })

    queries.push('}');
    queries.push('');

    return queries;
  }

  private generateGqlSchemaMutations(tableDefs: TableDef[]) {
    const queries = ['', 'extend type Mutation {'];
    tableDefs.forEach(table => {
      queries.push(`  insert_${table.tableName}(value: ${Globals.getGqlName(table.tableName)}_upsert!): MutationResult!`);
      queries.push(`  update_${table.tableName}(where: [WhereClause!]!, value: ${Globals.getGqlName(table.tableName)}_upsert!): MutationResult!`);
      queries.push(`  delete_${table.tableName}(where: [WhereClause!]!): MutationResult!`);
    })

    queries.push('}');
    queries.push('');

    return queries;
  }
}
