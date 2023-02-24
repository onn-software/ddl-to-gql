import { baseRepo, repoTemplate } from './repo-generator.templates';
import { TableDef } from '../model';
import { Globals } from '../globals';

export class RepoGenerator {
  execute(tableDefs: TableDef[]): string {
    const partialsDefs = tableDefs.map((tableDef) => this.generateRepo(tableDef));
    return baseRepo + partialsDefs.join('\n');
  }

  private generateRepo(tableDef: TableDef): string {
    const interfaceName = Globals.getTypescriptName(tableDef.tableName);

    const remapKeys = tableDef.columns.filter((c) => !!c.sqlKey);
    const mappers = remapKeys
      .map((c) => {
        const safeSqlKey = c.sqlKey?.startsWith('`') ? c.sqlKey : `\`${c.sqlKey}\``;
        return `    res.${c.key} = res[${safeSqlKey}];\n    delete res[${safeSqlKey}]`;
      })
      .join('\n');
    const paginatedMappers =
      remapKeys.length === 0
        ? ''
        : `    paginated.data = paginated.data.map((res: any) => {\n${mappers.replaceAll(
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
      .replaceAll('__MAPPERS__', mappers)
      .replaceAll('__PAGINATED_MAPPERS__', paginatedMappers)
      .replaceAll('__FIELD_GETTER_BLOCK__', '') // fieldKeyBlocks.join('\n'))
      .replaceAll('__PAGINATED_FIELD_GETTER_BLOCK__', ''); // paginatedFieldKeyBlocks.join('\n'));
  }
}
