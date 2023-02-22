import { TableDef } from '../model';
import { Globals } from '../globals';
import {
  baseResolver,
  getResolverBlock,
  paginatedResolverBlock, queryResolverEntry, queryResolvers,
  resolverTemplate,
} from './resolver-generator.templates';

export class ResolverGenerator {
  execute(tableDefs: TableDef[]): string {
    const partialsDefs = tableDefs.map((tableDef) => this.generateResolver(tableDef));

    partialsDefs.push('');
    partialsDefs.push('export const allGqlResolvers = {');
    partialsDefs.push(
      tableDefs
        .map((table) => {
          const interfaceName = Globals.getGqlName(table.tableName);
          return `  ${interfaceName}: ${interfaceName}_Resolver`;
        })
        .join(',\n')
    );
    partialsDefs.push('};');
    partialsDefs.push('');

    const queryResolvers = this.generateQueryResolvers(tableDefs);

    return baseResolver + partialsDefs.join('\n') + queryResolvers;
  }

  private generateQueryResolvers(tableDefs: TableDef[]): string {
    const entries = tableDefs.map((table) =>
        queryResolverEntry
        .replaceAll('__TABLE_NAME__', table.tableName)
        .replaceAll('__SQL_TYPE__', Globals.getTypescriptName(table.tableName))
    );

    return queryResolvers.replaceAll('__RESOLVER_ENTRIES__', entries.join('\n'));
  }

  private generateResolver(tableDef: TableDef): string {
    const manyRelations = tableDef.relations.filter((relation) => relation.many);
    const paginatedFieldKeyBlocks = manyRelations.map((relation) => {
      return paginatedResolverBlock
        .replaceAll('__RELATION_NAME__', Globals.composeToRelationKey(relation))
        .replaceAll('__SQL_TYPE__', Globals.getTypescriptName(tableDef.tableName))
        .replaceAll('__FOREIGN_SQL_TYPE__', Globals.getTypescriptName(relation.to.table))
        .replaceAll('__SAFE_FOREIGN_FIELD_NAME__', relation.to.key) // makeFieldNameSafe(relation.to.key)
        .replaceAll('__SAFE_FIELD_NAME__', relation.from.key); // makeFieldNameSafe(relation.from.key)
    });

    const singleRelations = tableDef.relations.filter((relation) => !relation.many);
    const fieldKeyBlocks = singleRelations.map((relation) => {
      return getResolverBlock
        .replaceAll('__RELATION_NAME__', Globals.composeToRelationKey(relation))
        .replaceAll('__SQL_TYPE__', Globals.getTypescriptName(tableDef.tableName))
        .replaceAll('__FOREIGN_SQL_TYPE__', Globals.getTypescriptName(relation.to.table))
        .replaceAll('__SAFE_FOREIGN_FIELD_NAME__', relation.to.key) // makeFieldNameSafe(relation.to.key)
        .replaceAll('__SAFE_FIELD_NAME__', relation.from.key); // makeFieldNameSafe(relation.from.key)
    });

    return resolverTemplate
      .replaceAll('__GQL_TYPE__', Globals.getGqlName(tableDef.tableName))
      .replaceAll('__FIELD_GETTER_BLOCK__', fieldKeyBlocks.join('\n'))
      .replaceAll('__PAGINATED_FIELD_GETTER_BLOCK__', paginatedFieldKeyBlocks.join('\n'));
  }
}
