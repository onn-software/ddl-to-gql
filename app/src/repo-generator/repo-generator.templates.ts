export const baseRepo = `import * as model from './model';

export interface OnnRepo<T extends {}> {
  insertBy(context: model.OnnContext, _: unknown, value: T): Promise<model.InsertResult>;
  upsertBy(context: model.OnnContext, clauses: model.Clause<keyof T>[], value: T): Promise<model.MutationResult>;
  updateBy(context: model.OnnContext, clauses: model.Clause<keyof T>[], value: Partial<T>): Promise<model.MutationResult>;
  deleteBy(context: model.OnnContext, clauses: model.Clause<keyof T>[], _: unknown): Promise<model.MutationResult>;
  getBy(context: model.OnnContext, clauses: model.Clause<keyof T>[], orderBy?: { field: string, direction: 'asc' | 'desc' }, fields?: string[]): Promise<T>;
  getPaginatedBy(context: model.OnnContext,
    clauses: model.Clause<keyof T>[],
    paginate?: model.Paginate | null,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    distinct?: string[],
    fields?: string[],
    builder?: (qb: model.QueryBuilder<T>) => model.QueryBuilder<T>
  ): Promise<model.Paginated<T>>;

  insert(context: model.OnnContext, value: T): Promise<model.InsertResult>;
  upsertByEquals(context: model.OnnContext, key: keyof T, keyValue: any, value: T): Promise<model.MutationResult>;
  updateByEquals(context: model.OnnContext, key: keyof T, keyValue: any, value: Partial<T>): Promise<model.MutationResult>;
  deleteByEquals(context: model.OnnContext, key: keyof T, keyValue: any, _: unknown): Promise<model.MutationResult>;
  getByEquals(context: model.OnnContext, key: keyof T, keyValue: any, orderBy?: { field: string, direction: 'asc' | 'desc' }, fields?: string[]): Promise<T>;
  getPaginatedByEquals(context: model.OnnContext,
                 key: keyof T, 
                 keyValue: any,
                 paginate?: model.Paginate | null,
                 orderBy?: { field: string, direction: 'asc' | 'desc' },
                 distinct?: string[],
                 fields?: string[],
                 builder?: (qb: model.QueryBuilder<T>) => model.QueryBuilder<T>
  ): Promise<model.Paginated<T>>;
}

export abstract class OnnBaseRepo<SQL_TYPE extends {}> implements OnnRepo<SQL_TYPE> {

  static BUILDER_FACTORY: <T extends {}>(context: model.OnnContext | any) => model.QueryBuilder<T> = (context) => {
    throw new Error('No BUILDER_FACTORY set')
  };

  protected constructor(private tableName: string) {}

  builder = (context: model.OnnContext | any) => OnnBaseRepo.BUILDER_FACTORY<SQL_TYPE>(context).table(this.tableName);

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
  
  abstract insertBy(context: model.OnnContext, _: unknown, value: SQL_TYPE): Promise<model.InsertResult>;
  abstract updateBy(context: model.OnnContext, clauses: model.Clause<keyof SQL_TYPE>[], value: Partial<SQL_TYPE>): Promise<model.MutationResult>;
  abstract deleteBy(context: model.OnnContext, clauses: model.Clause<keyof SQL_TYPE>[], _: unknown): Promise<model.MutationResult>;
  abstract getBy(context: model.OnnContext, clauses: model.Clause<keyof SQL_TYPE>[], orderBy?: { field: string; direction: "asc" | "desc" }, fields?: string[]): Promise<SQL_TYPE>;
  abstract getPaginatedBy(context: model.OnnContext, clauses: model.Clause<keyof SQL_TYPE>[], paginate?: model.Paginate | null, orderBy?: { field: string; direction: "asc" | "desc" }, fields?: string[], distinct?: string[], builder?: (qb: model.QueryBuilder<SQL_TYPE>) => model.QueryBuilder<SQL_TYPE>): Promise<model.Paginated<SQL_TYPE>>;

  upsertByEquals = (context: model.OnnContext, key: keyof SQL_TYPE, keyValue: any, value: SQL_TYPE) => this.upsertBy(context, [{ field: key, operator: model.QueryOperator.EQUALS, value: keyValue }],value);
  updateByEquals = (context: model.OnnContext, key: keyof SQL_TYPE, keyValue: any, value: Partial<SQL_TYPE>) => this.updateBy(context, [{ field: key, operator: model.QueryOperator.EQUALS, value: keyValue }],value);
  deleteByEquals = (context: model.OnnContext, key: keyof SQL_TYPE, keyValue: any) => this.deleteBy(context, [{ field: key, operator: model.QueryOperator.EQUALS, value: keyValue }],null);
  getByEquals = (context: model.OnnContext, key: keyof SQL_TYPE, keyValue: any, orderBy?: { field: string; direction: "asc" | "desc" }, fields?: string[]) => this.getBy(context, [{ field: key, operator: model.QueryOperator.EQUALS, value: keyValue }],orderBy, fields);
  getPaginatedByEquals = (context: model.OnnContext, key: keyof SQL_TYPE, keyValue: any, paginate?: model.Paginate | null, orderBy?: { field: string; direction: "asc" | "desc" }, distinct?: string[], fields?: string[], builder?: (qb: model.QueryBuilder<SQL_TYPE>) => model.QueryBuilder<SQL_TYPE>) =>
      this.getPaginatedBy(context, [{ field: key, operator: model.QueryOperator.EQUALS, value: keyValue }], paginate, orderBy, distinct, fields, builder);
  
  async upsertBy(context: model.OnnContext, clauses: model.Clause<keyof SQL_TYPE>[], value: SQL_TYPE): Promise<model.MutationResult> {
    const current = await this.getBy(context, clauses);
    if(!current) {
      const res = await this.insertBy(context, null, value);
      return {rows: 1};
    }else {
      return await this.updateBy(context, clauses, value)
    };
  }
  
  async insert(context: model.OnnContext, value: SQL_TYPE): Promise<model.InsertResult> {
      return await this.insertBy(context, null, value);
  }
  
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
    context: model.OnnContext | any,
    _: unknown,
    value: model.__SQL_TYPE__): Promise<model.InsertResult> {
    
__UNSAFE_VALUE_MAPPERS__

    return await this.builder(context)
      .executeInsert(value) as any;
  }
  
  async updateBy(
    context: model.OnnContext | any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    value: Partial<model.__SQL_TYPE__>): Promise<model.MutationResult> {
    
__UNSAFE_CLAUSE_MAPPERS__
__UNSAFE_VALUE_MAPPERS__

    return await this.builder(context)
      .where(...clauses)
      .executeUpdate(value) as any;
  }
  
  async deleteBy(
    context: model.OnnContext | any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    _: unknown): Promise<model.MutationResult> {
    
__UNSAFE_CLAUSE_MAPPERS__

    return await this.builder(context)
      .where(...clauses)
      .executeDelete() as any;
  }
  
  async getBy(
    context: model.OnnContext | any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    fields: string[] = ['*']
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
    context: model.OnnContext | any,
    clauses: model.Clause<keyof model.__SQL_TYPE__>[],
    paginate?: model.Paginate | null,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    distinct: string[] = [],
    fields: string[] = ['*'],
    builder: (qb: model.QueryBuilder<model.__SQL_TYPE__>) => model.QueryBuilder<model.__SQL_TYPE__> = qb => qb
  ): Promise<model.Paginated<model.__SQL_TYPE__>> {  
__UNSAFE_ORDER_MAPPERS__
__UNSAFE_DISTINCT_MAPPERS__
__UNSAFE_CLAUSE_MAPPERS__
    const queryBuilder = this.builder(context).where(...clauses).distinct(distinct);
    const paginated = await this.paginate(builder(queryBuilder), fields, paginate ?? { pageIndex: -1, pageSize: -1 }, orderBy);
__SAFE_PAGINATED_MAPPERS__
    return paginated;
  }
}

`;
