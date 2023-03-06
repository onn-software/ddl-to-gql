import { TableColDef, TableDef, TableRelationDef } from '../model';

interface FlatTableColDef extends TableColDef {
  flatKeyName: string;
}

interface FlatTableDef extends TableDef {
  flatTableName: string;
  columns: FlatTableColDef[];
}

export interface HeuristicEngineOptions {
  suffixes: string[];
  heurEnableAll?: boolean;
}

export class HeuristicEngine {
  execute(tableDefs: TableDef[], options: HeuristicEngineOptions): TableDef[] {
    const flatTableDefs = this.flattenNames(tableDefs);
    const res: string[] = [];

    const heuristics: Record<string, TableDef> = {};
    flatTableDefs.forEach(
      (t) => (heuristics[t.tableName] = { tableName: t.tableName, columns: [], relations: [] })
    );

    this.crossAllTableAndColumnDefinitions(
      flatTableDefs,
      (leftTable, leftCol, rightTable, rightCol) => {
        const relationsByNameMatch = this.missingRelationByNameMatch(
          leftTable,
          leftCol,
          rightTable,
          rightCol,
          options.heurEnableAll ?? false
        );
        if (relationsByNameMatch) {
          heuristics[leftTable.tableName].relations.push(relationsByNameMatch);
        }
        const relationsBySuffix = this.missingRelationBySuffix(
          leftTable,
          leftCol,
          rightTable,
          rightCol,
          options.suffixes.map((s) => s.toUpperCase()),
          options.heurEnableAll ?? false
        );
        if (relationsBySuffix) {
          heuristics[leftTable.tableName].relations.push(relationsBySuffix);
        }
      }
    );

    return Object.values(heuristics);
  }

  private flattenNames(tableDefs: TableDef[]): FlatTableDef[] {
    const res: FlatTableDef[] = JSON.parse(JSON.stringify(tableDefs));
    res.forEach((table) => {
      table.flatTableName = table.tableName.replaceAll(/[^a-zA-Z0-9]/g, '').toUpperCase();
      table.columns.forEach((col) => {
        col.flatKeyName = col.key.replaceAll(/[^a-zA-Z0-9]/g, '').toUpperCase();
      });
    });
    return res;
  }

  private missingRelationByNameMatch(
    leftTableDef: FlatTableDef,
    leftCol: FlatTableColDef,
    rightTableDef: FlatTableDef,
    rightCol: FlatTableColDef,
    heurEnableAll: boolean
  ): TableRelationDef | null {
    if (leftCol.flatKeyName === rightCol.flatKeyName && leftCol.type === rightCol.type) {
      return this.buildRelation(
        leftTableDef,
        leftCol,
        rightTableDef,
        rightCol,
        true,
        'nameMatch',
        heurEnableAll
      );
    }
    return null;
  }

  /**
   * Create relation based on suffix, will not make additional relations that are already found by foreign key constraints.
   *
   * For example:
   * Customer.orderId to optional Order.id
   * Order.id to many Customer.orderId
   * Customer.secondaryOrderId to optional undefined
   *
   * @param leftTableDef
   * @param leftCol
   * @param rightTableDef
   * @param rightCol
   * @param suffixes
   * @private
   */
  private missingRelationBySuffix(
    leftTableDef: FlatTableDef,
    leftCol: FlatTableColDef,
    rightTableDef: FlatTableDef,
    rightCol: FlatTableColDef,
    suffixes: string[],
    heurEnableAll: boolean
  ): TableRelationDef | null {
    if (leftCol.type !== rightCol.type) {
      // No type match, so no relation
      return null;
    }

    const leftSuffix = suffixes.find((suf) => leftCol.flatKeyName.endsWith(suf));
    const rightSuffix = suffixes.find((suf) => rightCol.flatKeyName.endsWith(suf));

    if (!leftSuffix || !rightSuffix) {
      // no left suffixes found
      return null;
    }
    if (leftSuffix !== rightSuffix) {
      // suffixes not identical
      return null;
    }

    const leftSuffixIndex = leftCol.flatKeyName.indexOf(leftSuffix);
    const rightSuffixIndex = rightCol.flatKeyName.indexOf(rightSuffix);
    const leftEndsWithSuffix = leftSuffixIndex > 0;
    const leftIsSuffix = leftSuffixIndex == 0;
    const rightEndsWithSuffix = rightSuffixIndex > 0;
    const rightIsSuffix = rightSuffixIndex == 0;

    if (!((leftEndsWithSuffix && rightIsSuffix) || (rightEndsWithSuffix && leftIsSuffix))) {
      // no suffixes to id match found
      return null;
    }

    const leftFlatKey = leftCol.flatKeyName.substring(0, leftSuffixIndex) || leftCol.flatKeyName;
    const rightFlatKey =
      rightCol.flatKeyName.substring(0, rightSuffixIndex) || rightCol.flatKeyName;

    if (
      leftTableDef.flatTableName !== rightFlatKey &&
      leftTableDef.flatTableName !== `${rightFlatKey}S` &&
      rightTableDef.flatTableName !== leftFlatKey &&
      rightTableDef.flatTableName !== `${leftFlatKey}S`
    ) {
      // no key to table name found
      return null;
    }

    return this.buildRelation(
      leftTableDef,
      leftCol,
      rightTableDef,
      rightCol,
      leftIsSuffix,
      'suffixMatch',
      heurEnableAll
    );
  }

  private buildRelation(
    leftTableDef: FlatTableDef,
    leftCol: FlatTableColDef,
    rightTableDef: FlatTableDef,
    rightCol: FlatTableColDef,
    many: boolean,
    type: string,
    heurEnableAll: boolean
  ): TableRelationDef | null {
    const relationsAlreadyExists =
      leftTableDef.relations.findIndex((value) => {
        return (
          (value.from.table === leftTableDef.tableName &&
            value.from.key === leftCol.key &&
            value.to.table === rightTableDef.tableName &&
            value.to.key === rightCol.key) ||
          (value.to.table === leftTableDef.tableName &&
            value.to.key === leftCol.key &&
            value.from.table === rightTableDef.tableName &&
            value.from.key === rightCol.key)
        );
      }) >= 0;
    if (!relationsAlreadyExists) {
      return {
        from: {
          table: leftTableDef.tableName,
          key: leftCol.key,
        },
        to: {
          table: rightTableDef.tableName,
          key: rightCol.key,
        },
        many,
        type,
        enabled: heurEnableAll,
        nullable: !many,
      };
    }

    return null;
  }

  private crossAllTableAndColumnDefinitions(
    flatTableDefs: FlatTableDef[],
    block: (
      leftTable: FlatTableDef,
      leftCol: FlatTableColDef,
      rightTable: FlatTableDef,
      rightCol: FlatTableColDef
    ) => void
  ) {
    flatTableDefs.forEach((leftTableDef) => {
      leftTableDef.columns.forEach((leftCol) => {
        flatTableDefs.forEach((rightTableDef) => {
          if (rightTableDef.flatTableName !== leftTableDef.flatTableName) {
            rightTableDef.columns.forEach((rightCol) => {
              block(leftTableDef, leftCol, rightTableDef, rightCol);
            });
          }
        });
      });
    });
  }
}
