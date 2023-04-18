import { baseRepo, repoTemplate } from './repo-generator.templates';
import { TableColDef, TableDef } from '../model';
import { Globals } from '../globals';

export class RepoGenerator {
  execute(tableDefs: TableDef[]): string {
    const partialsDefs = tableDefs.map((tableDef) => this.generateRepo(tableDef));
    const repoFactories = this.generateFactories(tableDefs).join('\n')
    return baseRepo.replaceAll("__REPO_FACTORIES__", repoFactories) + partialsDefs.join('\n');
  }

  private generateRepo(tableDef: TableDef): string {
    const interfaceName = Globals.getTypescriptName(tableDef.tableName);

    const remapKeys = tableDef.columns.filter((c) => !!c.sqlKey);

    const { lookupTable, unSafeValueMappers, unSafeOrderMappers, unSafeClauseMappers, unSafeDistinctMappers } = this.buildUnsafeMappers(interfaceName, remapKeys);

    const safeMappers = remapKeys
      .map((c) => {
        const safeSqlKey = c.sqlKey?.startsWith('`') ? c.sqlKey : `\`${c.sqlKey}\``;
        return `    res.${c.key} = res[${safeSqlKey}];`;
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
      .replaceAll('__UNSAFE_VALUE_MAPPERS__', unSafeValueMappers)
      .replaceAll('__UNSAFE_ORDER_MAPPERS__', unSafeOrderMappers)
      .replaceAll('__UNSAFE_DISTINCT_MAPPERS__', unSafeDistinctMappers)
      .replaceAll('__UNSAFE_CLAUSE_MAPPERS__', unSafeClauseMappers)
      .replaceAll('__SAFE_MAPPERS__', safeMappers)
      .replaceAll('__SAFE_PAGINATED_MAPPERS__', safePaginatedMappers)
      .replaceAll('__FIELD_GETTER_BLOCK__', '') // fieldKeyBlocks.join('\n'))
      .replaceAll('__PAGINATED_FIELD_GETTER_BLOCK__', ''); // paginatedFieldKeyBlocks.join('\n'));
  }

  private buildUnsafeMappers(
    interfaceName: string,
    remapKeys: TableColDef[]
  ): { lookupTable: string; unSafeValueMappers: string; unSafeOrderMappers: string; unSafeClauseMappers: string; unSafeDistinctMappers: string } {
    if (remapKeys.length <= 0) {
      return { lookupTable: '', unSafeValueMappers: '', unSafeOrderMappers: '', unSafeClauseMappers: '', unSafeDistinctMappers: '' };
    }

    const lookupTable = `
    const ${interfaceName}FieldLookUp: Record<string, string> = {
${remapKeys.map((c) => `      ${c.key}: ${c.sqlKey}`).join(',\n')}
    };
    
    `;

    const unSafeValueMappers = `
    const anyValue: any = { ...value };
    const keys = Object.keys(value);
    keys.filter(key => !!${interfaceName}FieldLookUp[key]).forEach(key => {
      anyValue[${interfaceName}FieldLookUp[key]] = anyValue[key]
      delete anyValue[key]
    });
    value = anyValue;
    `;
    const unSafeOrderMappers = `    if(orderBy?.field) orderBy.field = ${interfaceName}FieldLookUp[orderBy.field] ?? orderBy.field;`;
    const unSafeClauseMappers = `    clauses = clauses.map(clause => ({...clause, field: ${interfaceName}FieldLookUp[clause.field] ?? clause.field})) as any;`;
    const unSafeDistinctMappers = `    distinct = distinct?.map(entry => ${interfaceName}FieldLookUp[entry] ?? entry);`;

    return { lookupTable, unSafeValueMappers, unSafeOrderMappers, unSafeClauseMappers, unSafeDistinctMappers };
  }

    private generateFactories(tableDefs: TableDef[]) {
        return tableDefs.map(tableDef => `    ${tableDef.tableName}: () => new ${Globals.getTypescriptName(tableDef.tableName)}_Repo() as any,`)
    }
}
