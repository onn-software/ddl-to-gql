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

export interface Clause<T = string> { 
    field: T; 
    operator: QueryOperator; 
    value: any;
}

export interface InsertResult { 
    res: string;
    error?: string;
}

export interface MutationResult { 
    rows: number;
    error?: string;
}

export const initialOnnContext = {
  onn: {
    skipCache: false,
    cache: {},
    extras: {},
  }
}

export interface OnnContext {
  onn: {
    skipCache: boolean
    cache: Record<string, any>
    extras: Record<string, any>
  }
}

export interface QueryBuilder<TYPE extends {}, IMPL = any> {
    executeQuery(): Promise<TYPE[]>;
    executeCount(): Promise<number>;
    executeInsert(value: Partial<TYPE>): Promise<InsertResult>;
    executeUpdate(value: Partial<TYPE>): Promise<MutationResult>;
    executeDelete(): Promise<MutationResult>;
    table(tableName:string): QueryBuilder<TYPE, IMPL>;
    orderBy(orderBy?: { field: string, direction: 'asc' | 'desc' }): QueryBuilder<TYPE, IMPL>;
    distinct(distinct?: string[]): QueryBuilder<TYPE, IMPL>;
    where(...clause: Clause[]): QueryBuilder<TYPE, IMPL>;
    select(fields: string | string[]): QueryBuilder<TYPE, IMPL>;
    offset(offset: number): QueryBuilder<TYPE, IMPL>;
    limit(limit: number): QueryBuilder<TYPE, IMPL>;
}

`;
