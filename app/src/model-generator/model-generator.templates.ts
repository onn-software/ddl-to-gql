export const baseModel = `export interface Paginate {
  pageIndex: number,
  pageSize: number,
}

export interface Paginated<T> extends Paginate {
  totalEntries: number,
  data: T[],
}

export enum QueryOperator {
  EQUALS = 'EQUALS',
  IN = 'IN',
  BETWEEN = 'BETWEEN',
  LIKE = 'LIKE',
  NULL = 'NULL',
  NOT_EQUALS = 'NOT_EQUALS',
  NOT_IN = 'NOT_IN',
  NOT_BETWEEN = 'NOT_BETWEEN',
  NOT_NULL = 'NOT_NULL',
}

export interface Clause { 
    field: string; 
    value: any;
    operator: QueryOperator; 
}

export interface MutationResult { 
    rows: number;
    error?: string;
}

export interface QueryBuilder<TYPE extends {}, IMPL = any> {
    executeQuery(): Promise<TYPE[]>;
    executeCount(): Promise<number>;
    executeInsert(value: Partial<TYPE>): Promise<MutationResult>;
    executeUpdate(value: Partial<TYPE>): Promise<MutationResult>;
    executeDelete(): Promise<MutationResult>;
    table(tableName:string): QueryBuilder<TYPE, IMPL>;
    orderBy(orderBy?: { field: string, direction: 'asc' | 'desc' }): QueryBuilder<TYPE, IMPL>;
    where(...clause: Clause[]): QueryBuilder<TYPE, IMPL>;
    select(fields: string | string[]): QueryBuilder<TYPE, IMPL>;
    offset(offset: number): QueryBuilder<TYPE, IMPL>;
    limit(limit: number): QueryBuilder<TYPE, IMPL>;
}

`;
