import { associateBy } from '../util';
import { TableColDef, TableDef } from '../model';
import { reservedNames, typeMap } from './ddl-interpreter.templates';

export class DdlInterpreter {
  execute(ddl: string) {
    const splittedSchema = ddl.split(/create table /i).slice(1);

    return this.createTwoWayRelations(
      splittedSchema.map((part) => {
        const { tableName, lines } = this.extractTableContents(part);
        const singleLines = this.ensureSingleLineStatements(lines);
        const { fields, meta } = this.splitIntoFieldsAndMeta(singleLines);
        const columns = this.parseToColumns(fields);
        const { primaryKey, relations } = this.parseMeta(tableName, fields, meta);

        const columnMap = associateBy(columns, (f) => f.key);
        if (primaryKey) {
          columnMap[primaryKey].unique = true;
        }

        return {
          tableName,
          columns,
          relations,
        } as TableDef;
      })
    );
  }

  private parseToColumns(fields: string[]): TableColDef[] {
    return fields
      .map((fields) => fields.replaceAll(', ', ','))
      .map((field) => {
        const upperField = field.toUpperCase();
        const parts = field.split(' ').filter((part) => part.trim().length > 0);
        const [sqlKey, sqlType] = parts.map((part) => part.trim());

        const key = this.keyFromSqlKey(sqlKey);
        const res: TableColDef = {
          sqlType,
          sqlKey: key.startsWith('_') ? sqlKey : undefined,
          key,
          unique: upperField.indexOf('PRIMARY KEY') >= 0 || upperField.indexOf('UNIQUE') >= 0,
          type: typeMap[sqlType.split('(')[0].toUpperCase()] ?? 'string',
          nullable: upperField.indexOf('NOT NULL') < 0,
        };
        return res;
      });
  }

  private keyFromSqlKey(sqlKey: string) {
    let key = sqlKey.replaceAll('`', '');
    if (reservedNames.indexOf(key.toUpperCase()) >= 0 || !/^[a-zA-Z]/.test(key)) {
      key = '_' + key;
    }
    return key;
  }

  private extractTableContents(part: string): { tableName: string; lines: string[] } {
    const tableName = part
      .substring(0, part.indexOf(' '))
      .replaceAll('\r', '')
      .split('\n')[0]
      .replaceAll('`', '')
      .replaceAll('.', '__');
    let count = 1;
    let index = part.indexOf('(') + 1;
    const maxIndex = part.length;
    while (count > 0 && index <= maxIndex) {
      if (part[index] === ')') count--;
      if (part[index] === '(') count++;
      index++;
    }

    const lines = part.substring(part.indexOf('('), index).replaceAll('\r', '').split('\n');

    return { tableName, lines } as const;
  }

  private ensureSingleLineStatements(lines: string[]): string[] {
    const singleLines: string[] = [];
    let currentLine = '';
    lines.slice(1, lines.length - 1).forEach((l) => {
      const line = l.trim();
      currentLine = `${currentLine}${line}`;
      if (l.endsWith(',')) {
        singleLines.push(currentLine.substring(0, currentLine.length - 1));
        currentLine = '';
      } else {
        currentLine = `${currentLine} `;
      }
    });
    if (currentLine.length > 1) {
      singleLines.push(currentLine.trim());
    }

    return singleLines;
  }

  private splitIntoFieldsAndMeta(singleLines: string[]): { meta: string[]; fields: string[] } {
    const splitIndex = singleLines.findIndex(
      (value) => reservedNames.indexOf(value.split(' ')[0].toUpperCase()) >= 0
    );
    if (splitIndex < 0) {
      return { fields: singleLines, meta: [] };
    }
    const fields = singleLines.slice(0, splitIndex);
    const meta = singleLines.slice(splitIndex);

    return { fields, meta };
  }

  private parseMeta(tableName: string, fields: string[], meta: string[]) {
    let primaryKey = '';
    const relations: any[] = [];
    meta
      .map((met) => met.trim())
      .forEach((met) => {
        const upperMeta = met.trim();
        if (upperMeta.startsWith('PRIMARY KEY (')) {
          const keyJoined = met.substring(met.indexOf('(') + 1, met.indexOf(')'));
          const keys = keyJoined.split(',').map((k) => this.keyFromSqlKey(k.trim()));
          if (keys.length === 1) {
            primaryKey = keys[0];
          }
          return;
        }

        const foreignKeyKeywordIndex = upperMeta.indexOf('FOREIGN KEY');
        if (foreignKeyKeywordIndex >= 0) {
          const relationPart = met.substring(foreignKeyKeywordIndex + 10);
          const myKey = this.keyFromSqlKey(
            relationPart.substring(relationPart.indexOf('(') + 1, relationPart.indexOf(')'))
          );

          const [foreignName, foreignKeyDirty] = relationPart
            .split(/references/i)[1]
            .trim()
            .split(' ');
          const foreignKey = this.keyFromSqlKey(
            foreignKeyDirty.substring(
              foreignKeyDirty.indexOf('(') + 1,
              foreignKeyDirty.indexOf(')')
            )
          );

          relations.push({
            from: { table: tableName, key: myKey },
            to: { table: foreignName.replaceAll('`', '').replaceAll('.', '__'), key: foreignKey },
            many: false,
          });
          return;
        }
      });

    return { primaryKey, relations };
  }

  private createTwoWayRelations(tables: TableDef[]): TableDef[] {
    const recordTables: Record<string, TableDef> = {};
    tables.forEach((t) => (recordTables[t.tableName] = JSON.parse(JSON.stringify(t))));

    tables.forEach((table) => {
      table.relations.forEach((rel) => {
        recordTables[rel.to.table].relations.push({ to: rel.from, from: rel.to, many: true });
      });
    });

    return Object.values(recordTables);
  }
}
