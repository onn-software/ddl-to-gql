export const baseRepo = `import * as model from './model';

export interface OnnRepo<T extends {}> {
  insertBy(
    context: any,
    _: unknown,
    value: Partial<T>): Promise<model.MutationResult>;
  updateBy(
    context: any,
    clauses: model.Clause<keyof T>[],
    value: Partial<T>): Promise<model.MutationResult>;
  deleteBy(
    context: any,
    clauses: model.Clause<keyof T>[],
    _: unknown): Promise<model.MutationResult>;
  getBy(
    context: any,
    clauses: model.Clause<keyof T>[],
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    fields?: string[],
  ): Promise<T>;

  getPaginatedBy(
    context: any,
    clauses: model.Clause<keyof T>[],
    paginate?: model.Paginate | null,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    fields?: string[],
    builder?: (qb: model.QueryBuilder<T>) => model.QueryBuilder<T>
  ): Promise<model.Paginated<T>>;
}

export abstract class OnnBaseRepo<SQL_TYPE extends {}> implements OnnRepo<SQL_TYPE> {

  static BUILDER_FACTORY: <T extends {}>(context: any) => model.QueryBuilder<T> = (context) => {
    throw new Error('No BUILDER_FACTORY set')
  };

  protected constructor(private tableName: string) {}

  builder = (context: any) => OnnBaseRepo.BUILDER_FACTORY<SQL_TYPE>(context).table(this.tableName);

  paginate = async (
    qb: model.QueryBuilder<SQL_TYPE>,
    fields: string[] = ['*'],
    paginate: model.Paginate,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
  ): Promise<model.Paginated<SQL_TYPE>> => {
    const totalEntries = await qb.executeCount();
    
    const _qb = qb.select(fields).orderBy(orderBy);
    const noLimit = paginate.pageSize <= 0;
    const query = noLimit ? _qb : _qb.offset(paginate.pageIndex * paginate.pageSize).limit(paginate.pageSize);
    const data = await query.executeQuery();

    return {
      pageIndex: noLimit ? 0 : paginate.pageIndex,
      pageSize: noLimit ? totalEntries : paginate.pageSize,
      totalEntries,
      data: data,
    };
  };
  
  abstract deleteBy(context: any, clauses: model.Clause<keyof SQL_TYPE>[], _: unknown): Promise<model.MutationResult>;
  abstract getBy(context: any, clauses: model.Clause<keyof SQL_TYPE>[], orderBy?: { field: string; direction: "asc" | "desc" }, fields?: string[]): Promise<SQL_TYPE>;
  abstract getPaginatedBy(context: any, clauses: model.Clause<keyof SQL_TYPE>[], paginate?: model.Paginate | null, orderBy?: { field: string; direction: "asc" | "desc" }, fields?: string[], builder?: (qb: model.QueryBuilder<SQL_TYPE>) => model.QueryBuilder<SQL_TYPE>): Promise<model.Paginated<SQL_TYPE>>;
  abstract insertBy(context: any, _: unknown, value: Partial<SQL_TYPE>): Promise<model.MutationResult>;
  abstract updateBy(context: any, clauses: model.Clause<keyof SQL_TYPE>[], value: Partial<SQL_TYPE>): Promise<model.MutationResult>;
}

export const onnRepoFactory: Record<string, <T extends {}>() => OnnRepo<T>> = {
__REPO_FACTORIES__
}

`;

export const repoTemplate = `
__UNSAFE_LOOKUP__
export class __SQL_TYPE___Repo extends OnnBaseRepo<model.__SQL_TYPE__> {

  static TABLE = '__SQL_TABLE__';

  constructor() {
    super(__SQL_TYPE___Repo.TABLE);
  }
  
  async insertBy(
    context: any,
    _: unknown,
    value: Partial<model.__SQL_TYPE__>): Promise<model.MutationResult> {
    
__UNSAFE_VALUE_MAPPERS__

    return await this.builder(context)
      .executeInsert(value) as any;
  }
  
  async updateBy(
    context: any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    value: Partial<model.__SQL_TYPE__>): Promise<model.MutationResult> {
    
__UNSAFE_CLAUSE_MAPPERS__
__UNSAFE_VALUE_MAPPERS__

    return await this.builder(context)
      .where(...clauses)
      .executeUpdate(value) as any;
  }
  
  async deleteBy(
    context: any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    _: unknown): Promise<model.MutationResult> {
    
__UNSAFE_CLAUSE_MAPPERS__

    return await this.builder(context)
      .where(...clauses)
      .executeDelete() as any;
  }
  
  async getBy(
    context: any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    fields: string[] = ['*'],
  ): Promise<model.__SQL_TYPE__> {
__UNSAFE_ORDER_MAPPERS__
    const [res] = await this.builder(context)
        .select(fields)
        .where(...clauses)
        .orderBy(orderBy)
        .limit(1)
        .executeQuery() as any;
__SAFE_MAPPERS__
    return res;
  }

  async getPaginatedBy(
    context: any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    paginate?: model.Paginate | null,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    fields: string[] = ['*'],
    builder: (qb: model.QueryBuilder<model.__SQL_TYPE__>) => model.QueryBuilder<model.__SQL_TYPE__> = qb => qb
  ): Promise<model.Paginated<model.__SQL_TYPE__>> {  
__UNSAFE_ORDER_MAPPERS__
__UNSAFE_CLAUSE_MAPPERS__
    const queryBuilder = this.builder(context).where(...clauses);
    const paginated = await this.paginate(builder(queryBuilder), fields, paginate ?? { pageIndex: -1, pageSize: -1 }, orderBy);
__SAFE_PAGINATED_MAPPERS__
    return paginated;
  }
}

`;
