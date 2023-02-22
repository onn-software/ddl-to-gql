import {baseRepo,   repoTemplate} from './repo-generator.templates';
import {TableDef} from '../model';
import {Globals} from '../globals';

export class RepoGenerator {

  execute(tableDefs: TableDef[]): string {
    const partialsDefs = tableDefs.map((tableDef) => this.generateRepo(tableDef));
    return baseRepo + partialsDefs.join('\n');
  }

  private generateRepo(tableDef: TableDef): string {
    const interfaceName = Globals.getTypescriptName(tableDef.tableName);

    const unqiueFields = ["string", ...tableDef.columns.filter(c => c.unique).map(c=>`'${c.key}'`)].join(' | ');
    const nonUniqueFields = ["string", ...tableDef.columns.filter(c => !c.unique).map(c=>`'${c.key}'`)].join(' | ');

    return repoTemplate
        .replaceAll('__SQL_TYPE__', interfaceName)
        .replaceAll('__SQL_TABLE__', tableDef.tableName)
        .replaceAll('__UNIQUE_FIELDS__', unqiueFields)
        .replaceAll('__NON_UNIQUE_FIELDS__', nonUniqueFields)
        .replaceAll('__FIELD_GETTER_BLOCK__', "") // fieldKeyBlocks.join('\n'))
        .replaceAll('__PAGINATED_FIELD_GETTER_BLOCK__', "") // paginatedFieldKeyBlocks.join('\n'));
  }
}
