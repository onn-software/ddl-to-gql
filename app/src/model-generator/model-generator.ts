import { Globals } from '../globals';
import {baseModel} from './model-generator.templates';
import {TableDef, TableRelationDef} from '../model';

export class ModelGenerator {
  execute(tableDefs: TableDef[]): string {
    const partialsDefs = tableDefs.map((tableDef) => this.generateModel(tableDef));
    return baseModel + partialsDefs.join('\n');
  }

  private generateModel(tableDef: TableDef): string {
    const interfaceName = Globals.getTypescriptName(tableDef.tableName);
    const typeDef = [
      `export const ${interfaceName}__Table = '${tableDef.tableName}'`,
      '',
      `export interface ${interfaceName} {`,
    ];

    tableDef.columns.forEach((c) => {
      typeDef.push(`  ${c.key}${c.nullable ? '?' : ''}: ${c.type};${c.unique ? ' // unique' : ''}`);
    });

    if (tableDef.relations.length > 0) {
      typeDef.push('');
      typeDef.push('  // Relations');

      tableDef.relations.forEach((r) => {
        const type = Globals.getTypescriptName(r.to.table);
        const key = Globals.composeToRelationKey(r);
        if (r.many) {
          typeDef.push(`  ${key}?: Paginated<${type}>;`);
        } else {
          typeDef.push(`  ${key}?: ${type};`);
        }
      });
    }
    typeDef.push('}');
    typeDef.push('');

    return typeDef.join('\n');
  }
}
