export const baseModel = `export interface Paginate {
  pageIndex: number,
  pageSize: number,
}

export interface Paginated<T> extends Paginate {
  totalEntries: number,
  data: T[],
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

`;
