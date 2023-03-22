export const main = `import {allGqlQueryResolvers, allGqlResolvers, allGqlMutationResolvers, OnnResolverHooks} from './resolvers';
import {QueryBuilder, QueryOperator, Clause} from './model';
import {OnnBaseRepo} from './repos';

export interface GqlParams<GraphQLResolveInfo = any> {
  parent: any;
  args: Record<string, any>;
  context: any;
  info: GraphQLResolveInfo;
}

export type OnnBeforeGql = <T, E extends any>(resolverName: string, gqlParams: GqlParams) => Promise<{ value: T | null, gqlParams: GqlParams, extras?: E } | null>;
export type OnnAfterGql = <T, E extends any>(resolverName: string, result: T, gqlParams: GqlParams, extras?: E) => Promise<T>;
export type OnnExecute = (knexQb: Knex.QueryBuilder, action: string, options: any, context: any) => Promise<Knex.QueryBuilder | any>;

export class OnnDdlToGql<GraphQLResolveInfo = any> {
  constructor(queryBuilderFactory: <T extends {}>(context: any) => QueryBuilder<T>, options?: { onnBeforeGql?: OnnBeforeGql; onnAfterGql?: OnnAfterGql }) {
    OnnBaseRepo.BUILDER_FACTORY = queryBuilderFactory;
    
    if (options?.onnBeforeGql) {
      OnnResolverHooks.before = options.onnBeforeGql;
    }
    if (options?.onnAfterGql) {
      OnnResolverHooks.after = options.onnAfterGql;
    }
  }

  getAllTypeResolvers = () => allGqlResolvers;
  getAllQueryResolvers = () => allGqlQueryResolvers;
  getAllGqlMutationResolvers = () => allGqlMutationResolvers;
}

export const contextCachingOnExecute: OnnExecute = async (knexQb, action, options, context) => {
  if(['QUERY', 'COUNT'].indexOf(action) < 0) return knexQb;
  if (!context.onn) context.onn = {};
  const key = JSON.stringify(options);
  if (context.onn[key]) {
    return context.onn[key];
  }
  const value = await knexQb;
  context.onn[key] = value;
  return value;
};

__FACTORY__
`

export const knexFactrory = `import { Knex } from 'knex';

export const knexQueryBuilderFactory =
  (
    knex: Knex,
    onExecute: OnnExecute = contextCachingOnExecute
  ) =>
  <T extends {}>(context: any) =>
    new KnexQueryBuilder<T>(context, knex, onExecute);

export class KnexQueryBuilder<TYPE extends {}> implements QueryBuilder<TYPE, Knex> {
  private options: {
    table: string;
    where: Clause[];
    orderBy?: { field: string; direction: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
    select?: string | string[];
  } = {
    table: '',
    where: [],
  };

  constructor(private context: any, private knex: Knex, private onExecute: OnnExecute) {}

  private build(): Knex.QueryBuilder<TYPE> {
    let qb = this.knex<TYPE>(this.options.table) as Knex.QueryBuilder<TYPE>;
    
    this.options.where.forEach((clause) => {
      switch (clause.operator) {
        case QueryOperator.EQUALS:
          qb.where(clause.field, clause.value);
          break;
        case QueryOperator.IN:
          qb.whereIn(clause.field, clause.value);
          break;
        case QueryOperator.BETWEEN:
          qb.whereBetween(clause.field, clause.value);
          break;
        case QueryOperator.LIKE:
          qb.whereLike(clause.field, clause.value);
          break;
        case QueryOperator.NULL:
          qb.whereNull(clause.field);
          break;
        case QueryOperator.NOT_EQUALS:
          qb.whereNot(clause.field, clause.value);
          break;
        case QueryOperator.NOT_IN:
          qb.whereNotIn(clause.field, clause.value);
          break;
        case QueryOperator.NOT_BETWEEN:
          qb.whereNotBetween(clause.field, clause.value);
          break;
        case QueryOperator.NOT_NULL:
          qb.whereNotNull(clause.field);
          break;
      }
    });
    
    if(this.options.orderBy?.field) {
        qb.orderBy(this.options.orderBy.field, this.options.orderBy.direction);
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
    if (this.options.select) {
      qb.select(this.options.select);
    }
    
    return this.onExecute(qb, 'QUERY', this.options, this.context);
  }

  async executeCount(): Promise<number> {
    const count = await this.onExecute(this.build().count(), 'COUNT', this.options, this.context);
    return count[0]['count(*)'] as number;
  }
  
  async executeInsert(value: any): Promise<{success: boolean, error?:string}> {
    try {
      await this.onExecute(this.build().insert(value), 'INSERT', this.options, this.context);
      return {success: true}
    } catch (e: any) {
        return {success: false, error: e.message ?? e.toString()}
    }
  }
  
  async executeUpdate(value: any): Promise<{success: boolean, error?:string}> {
    try {
      await this.onExecute(this.build().update(value), 'UPDATE', this.options, this.context);
      return {success: true}
    } catch (e: any) {
        return {success: false, error: e.message ?? e.toString()}
    }
  }
  
  async executeDelete(): Promise<{success: boolean, error?:string}> {
    try {
      await this.onExecute(this.build().delete(), 'DELETE', this.options, this.context);
      return {success: true}
    } catch (e: any) {
        return {success: false, error: e.message ?? e.toString()}
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

  where(...clauses: Clause[]): QueryBuilder<TYPE, Knex> {
    this.options.where.push(...clauses);
    return this;
  }
}

`
