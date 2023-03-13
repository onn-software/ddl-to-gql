import { baseRepo, repoTemplate } from './repo-generator.templates';
import { TableColDef, TableDef } from '../model';
import { Globals } from '../globals';

export class RepoGenerator {
  execute(tableDefs: TableDef[]): string {
    const partialsDefs = tableDefs.map((tableDef) => this.generateRepo(tableDef));
    return baseRepo + partialsDefs.join('\n');
  }

  private generateRepo(tableDef: TableDef): string {
    const interfaceName = Globals.getTypescriptName(tableDef.tableName);

    const remapKeys = tableDef.columns.filter((c) => !!c.sqlKey);

    const { lookupTable, unSafeMappers, unSafePaginatedMappers } = this.buildUnsafeMappers(interfaceName, remapKeys);

    const safeMappers = remapKeys
      .map((c) => {
        const safeSqlKey = c.sqlKey?.startsWith('`') ? c.sqlKey : `\`${c.sqlKey}\``;
        return `    res.${c.key} = res[${safeSqlKey}];\n    delete res[${safeSqlKey}]`;
      })
      .join('\n');
    const safePaginatedMappers =
      remapKeys.length === 0
        ? ''
        : `    paginated.data = paginated.data.map((res: any) => {\n${safeMappers.replaceAll(
            '    ',
            '      '
          )}
      return res;
    });`;

    const unqiueKeys = [
      'string',
      ...tableDef.columns.filter((c) => c.unique).map((c) => `'${c.key}'`),
    ].join(' | ');
    const allKeys = ['string', ...tableDef.columns.map((c) => `'${c.key}'`)].join(' | ');

    return repoTemplate
      .replaceAll('__SQL_TYPE__', interfaceName)
      .replaceAll('__SQL_TABLE__', tableDef.tableName)
      .replaceAll('__UNIQUE_FIELDS__', unqiueKeys)
      .replaceAll('__NON_UNIQUE_FIELDS__', allKeys)
      .replaceAll('__UNSAFE_LOOKUP__', lookupTable)
      .replaceAll('__UNSAFE_MAPPERS__', unSafeMappers)
      .replaceAll('__UNSAFE_PAGINATED_MAPPERS__', unSafePaginatedMappers)
      .replaceAll('__SAFE_MAPPERS__', safeMappers)
      .replaceAll('__SAFE_PAGINATED_MAPPERS__', safePaginatedMappers)
      .replaceAll('__FIELD_GETTER_BLOCK__', '') // fieldKeyBlocks.join('\n'))
      .replaceAll('__PAGINATED_FIELD_GETTER_BLOCK__', ''); // paginatedFieldKeyBlocks.join('\n'));
  }

  private buildUnsafeMappers(
    interfaceName: string,
    remapKeys: TableColDef[]
  ): { lookupTable: string; unSafeMappers: string; unSafePaginatedMappers: string } {
    if (remapKeys.length < 0) {
      return { lookupTable: '', unSafeMappers: '', unSafePaginatedMappers: '' };
    }

    const lookupTable = `
    const ${interfaceName}FieldLookUp: Record<string, string> = {
${remapKeys.map((c) => `      ${c.key}: ${c.sqlKey}`).join(',\n')}
    };
    
    `;

    const unSafeMappers = `    if(orderBy?.field) orderBy.field = ${interfaceName}FieldLookUp[orderBy.field] ?? orderBy.field;`;
    const unSafePaginatedMappers = `    clauses = clauses.map(clause => ({...clause, field: ${interfaceName}FieldLookUp[clause.field] ?? clause.field}));`;

    return { lookupTable, unSafeMappers, unSafePaginatedMappers };
  }
}
