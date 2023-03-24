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
      if(c.nullable) {
        typeDef.push(`  ${c.key}?: (${c.type} | null);${c.unique ? ' // unique' : ''}`);
      }else {
        typeDef.push(`  ${c.key}: ${c.type};${c.unique ? ' // unique' : ''}`);
      }
    });

    typeDef.push('}');
    typeDef.push('');

    return typeDef.join('\n');
  }
}
