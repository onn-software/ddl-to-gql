
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
}

export interface TableDef {
    tableName: string;
    columns: TableColDef[];
    relations: TableRelationDef[];
}
