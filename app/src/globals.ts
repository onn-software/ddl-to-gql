import { TableRelationDef } from './model';

const relationTypeMap: Record<string, string> = {
  suffixMatch: 'suf',
  nameMatch: 'name',
  foreignKey: 'rel',
};

export class Globals {
  static TS_PREFIX = 'Onn';
  static GQL_PREFIX = 'Gql';

  static getTypescriptName(tableName: string) {
    return `${Globals.TS_PREFIX}_${tableName.replaceAll('.', '__')}`;
  }

  static getGqlName(tableName: string) {
    return `${Globals.GQL_PREFIX}_${tableName}`;
  }

  static composeToRelationKey(r: TableRelationDef) {
    return `${relationTypeMap[r.type]??r.type}__${r.to.table}__by__${r.from.key}__to__${
      r.to.key
    }`.replaceAll('`', '');
  }
}
