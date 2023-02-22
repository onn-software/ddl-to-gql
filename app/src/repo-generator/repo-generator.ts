import {ModelGenerator} from '../model-generator/model-generator';
import {distinct, distinctBy} from '../util';
import {baseRepo, byGetterBlock, byPaginatedGetterBlock, repoTemplate} from './repo-generator.templates';
import {TableDef} from '../model';
import {Globals} from '../globals';

export class RepoGenerator {

  execute(tableDefs: TableDef[]): string {
    const partialsDefs = tableDefs.map((tableDef) => this.generateRepo(tableDef));
    return baseRepo + partialsDefs.join('\n');
  }

  private generateRepo(tableDef: TableDef): string {
    const interfaceName = Globals.getTypescriptName(tableDef.tableName);

    const toManyRelations = tableDef.relations
        .filter((relation) => relation.many)
        .map((relation) => relation.to);
    const distinctToManyRelations = distinctBy(toManyRelations, (item) => item.key  )
    const paginatedFieldKeyBlocks = distinctToManyRelations.map((relation) => {
      return byPaginatedGetterBlock
          .replaceAll('__FOREIGN_SQL_TYPE__', Globals.getTypescriptName(tableDef.tableName))
          .replaceAll('__FOREIGN_FIELD_NAME__', relation.key)
          .replaceAll('__SAFE_FOREIGN_FIELD_NAME__', relation.key); // const safeField = makeFieldNameSafe(relation.field);
    });

    const keys = distinct([
      ...tableDef.columns.filter(c => c.unique).map(c=> c.key),
      ...tableDef.relations
          .filter((relation) => !relation.many)
          .map((relation) => relation.from.key),
    ]);
    const fieldKeyBlocks = keys.map((key) => {

      return byGetterBlock
          .replaceAll('__FIELD_NAME__', key)
          .replaceAll('__SAFE_FIELD_NAME__', key) // const safeField = makeFieldNameSafe(field);
          .replaceAll('__SQL_TYPE__', interfaceName);
    });

    return repoTemplate
        .replaceAll('__SQL_TYPE__', interfaceName)
        .replaceAll('__SQL_TABLE__', tableDef.tableName)
        .replaceAll('__FIELD_GETTER_BLOCK__', fieldKeyBlocks.join('\n'))
        .replaceAll('__PAGINATED_FIELD_GETTER_BLOCK__', paginatedFieldKeyBlocks.join('\n'));
  }
}
