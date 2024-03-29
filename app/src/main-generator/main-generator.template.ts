export const main = `import {allGqlQueryResolvers, allGqlTypeResolvers, allGqlMutationResolvers, OnnResolverHooks} from './resolvers';
import {QueryBuilder, QueryOperator, Clause, MutationResult, OnnContext, MemCache} from './model';
import {OnnBaseRepo} from './repos';

export interface GqlParams<GraphQLResolveInfo = any> {
  parent: any;
  args: Record<string, any>;
  context: OnnContext | any;
  info: GraphQLResolveInfo;
}

export interface OnnResolverWrapper {
  before: (resolverName:string, tableName :string, gqlParams: GqlParams) => Promise<any | undefined | null>;
  after: (resolverName:string, tableName :string, result: any, gqlParams: GqlParams) => Promise<any>;
}

export type OnnExecute = (knexQb: Knex.QueryBuilder, action: string, options: any, context: OnnContext | any) => Promise<Knex.QueryBuilder | any>;

export class OnnDdlToGql<GraphQLResolveInfo = any> {
  constructor(queryBuilderFactory: <T extends {}>(context: OnnContext | any) => QueryBuilder<T>, options?: { onnWrapperBuilder?: () => OnnResolverWrapper }) {
    OnnBaseRepo.BUILDER_FACTORY = queryBuilderFactory;
    
    if (options?.onnWrapperBuilder) {
      OnnResolverHooks.buildWrapper = options.onnWrapperBuilder;
    }
  }

  getAllTypeResolvers = () => allGqlTypeResolvers;
  getAllQueryResolvers = () => allGqlQueryResolvers;
  getAllGqlMutationResolvers = () => allGqlMutationResolvers;
}

export const SimpleOnExecute: OnnExecute = async (knexQb, action, options, context = {}) => {
    return knexQb;
}

export const contextCachingOnExecute: OnnExecute = async (knexQb, action, options, context = {}) => {
  if(context?.onn?.extras?.transacting){
    knexQb = knexQb.transacting(context.onn.extras.transacting)
  }
  if(['QUERY', 'COUNT'].indexOf(action) < 0) return knexQb;
  if (!context.onn) context.onn = {};
  if (context.onn.skipCache) return knexQb;
  if (!context.onn.cache) {
      context.onn.cache = new MemCache();
  }  
    
  let res = await context.onn.cache.get(options);
  if (!res) {
      res = await knexQb;
      await context.onn.cache.set(options, res);
  }
  return res;
};

__FACTORY__
`

export const knexFactrory = `import { Knex } from 'knex';

export interface KnexQueryBuilderOptions {
    table: string;
    where: Clause[];
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    distinct: string[];
    limit?: number;
    offset?: number;
    select?: string | string[];
}

export const knexQueryBuilderFactory =
  (
    knex: Knex,
    onExecute: OnnExecute = contextCachingOnExecute
  ) =>
  <T extends {}>(context: OnnContext | any) =>
    new KnexQueryBuilder<T>(context, knex, onExecute);

export class KnexQueryBuilder<TYPE extends {}> implements QueryBuilder<TYPE, Knex> {
  private options: KnexQueryBuilderOptions = {
    table: '',
    where: [],
    distinct: [],
  };

  constructor(private context: OnnContext | any, private knex: Knex, private onExecute: OnnExecute) {}

  private build(): Knex.QueryBuilder<TYPE> {
    let qb = this.knex<TYPE>(this.options.table) as Knex.QueryBuilder<TYPE>;
    
    this.options.where.forEach((clause) => {
      const safeField = this.options.table + "." + clause.field;
      switch (clause.operator) {
        case QueryOperator.EQUALS:
          qb.where(safeField, clause.value);
          break;
        case QueryOperator.IN:
          qb.whereIn(safeField, clause.value);
          break;
        case QueryOperator.BETWEEN:
          qb.whereBetween(safeField, clause.value);
          break;
        case QueryOperator.LIKE:
          qb.whereLike(safeField, clause.value);
          break;
        case QueryOperator.NULL:
          qb.whereNull(safeField);
          break;
        case QueryOperator.NOT_EQUALS:
          qb.whereNot(safeField, clause.value);
          break;
        case QueryOperator.NOT_IN:
          qb.whereNotIn(safeField, clause.value);
          break;
        case QueryOperator.NOT_BETWEEN:
          qb.whereNotBetween(safeField, clause.value);
          break;
        case QueryOperator.NOT_NULL:
          qb.whereNotNull(safeField);
          break;
      }
    });
    
    if(this.options.orderBy?.field) {
        qb.orderBy(this.options.table + "." + this.options.orderBy.field, this.options.orderBy.direction);
    }
    
    return qb;
  }

  async executeQuery(): Promise<TYPE[]> {
    const qb = this.build();
    if (this.options.offset) {
      qb.offset(this.options.offset);
    }
    if (this.options.limit) {
      qb.limit(this.options.limit);
    }
    if(this.options.distinct.length > 0) {
      qb.distinct(...this.options.distinct).select(...this.options.distinct);
    } else if (this.options.select) {
      qb.select(this.options.select);
    }
        
    return this.onExecute(qb, 'QUERY', this.options, this.context);
  }

  async executeCount(): Promise<number> {
    const count = await this.onExecute(this.build().count(), 'COUNT', this.options, this.context);
    return Object.values(count[0])[0] as number;
  }
  
  async executeInsert(value: any): Promise<MutationResult> {
    try {
      const [res] = await this.onExecute(this.build().insert(value), 'INSERT', this.options, this.context);
      return {rows: res ? 1 : 0, res: \`\${res}\`}
    } catch (e: any) {
        return {rows: 0, res: '', error: e.message ?? e.toString()}
    }
  }
  
  async executeUpdate(value: any): Promise<MutationResult> {
    try {
      const rows = await this.onExecute(this.build().update(value), 'UPDATE', this.options, this.context);
      return {rows, res: '', error: rows > 0 ? undefined : 'Nothing matches clauses'}
    } catch (e: any) {
        return {rows: 0, res: '', error: e.message ?? e.toString()}
    }
  }
  
  async executeDelete(): Promise<MutationResult> {
    try {
      const rows = await this.onExecute(this.build().delete(), 'DELETE', this.options, this.context);
      return {rows, res: '', error: rows > 0 ? undefined : 'Nothing matches clauses'}
    } catch (e: any) {
        return {rows: 0, res: '', error: e.message ?? e.toString()}
    }
  }

  limit(limit: number): QueryBuilder<TYPE, Knex> {
    this.options.limit = limit;
    return this;
  }

  offset(offset: number): QueryBuilder<TYPE, Knex> {
    this.options.offset = offset;
    return this;
  }

  select(fields: string | string[]): QueryBuilder<TYPE, Knex> {
    this.options.select = fields;
    return this;
  }

  table(tableName: string): QueryBuilder<TYPE, Knex> {
    this.options.table = tableName;
    return this;
  }

  orderBy(orderBy?: {field: string, direction: 'asc' | 'desc'}): QueryBuilder<TYPE, Knex> {
    this.options.orderBy = orderBy;
    return this;
  }

  distinct(distinct: string[] = []): QueryBuilder<TYPE, Knex> {
    this.options.distinct = distinct;
    return this;
  }

  where(...clauses: Clause[]): QueryBuilder<TYPE, Knex> {
    this.options.where.push(...clauses);
    return this;
  }
}

`
