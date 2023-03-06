
export interface TableColDef {
    key: string;
    type: string;
    sqlType: string;
    sqlKey?: string;
    nullable: boolean;
    unique: boolean;
}

export interface TableRelationDef {
    from: {
        table: string;
        key: string;
    };
    to: {
        table: string;
        key: string;
    };
    many: boolean;
    type: string;
    enabled: boolean;
    nullable: boolean;
}

export interface TableDef {
    tableName: string;
    columns: TableColDef[];
    relations: TableRelationDef[];
}

export interface QueryBuilder<TYPE extends {},IMPL = any> {
    execute(): Promise<TYPE[]>;
    executeCount(): Promise<number>;
    table(tableName:string): QueryBuilder<TYPE, IMPL>;
    where(field: string, values: any): QueryBuilder<TYPE, IMPL>;
    whereIn(field: string, values: any[]): QueryBuilder<TYPE, IMPL>;
    select(fields: string | string[]): QueryBuilder<TYPE, IMPL>;
    offset(offset: number): QueryBuilder<TYPE, IMPL>;
    limit(limit: number): QueryBuilder<TYPE, IMPL>;
}
