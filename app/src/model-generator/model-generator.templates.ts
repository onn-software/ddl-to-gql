export const baseModel = `export interface Paginate {
  pageIndex: number,
  pageSize: number,
}

export interface Paginated<T> extends Paginate {
  totalEntries: number,
  data: T[],
}

`;
