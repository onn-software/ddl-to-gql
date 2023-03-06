export const main = `import {allGqlQueryResolvers, allGqlResolvers, OnnResolverHooks} from './resolvers';
import {QueryBuilder} from './model';
import {OnnBaseRepo} from './repos';

export interface GqlParams<GraphQLResolveInfo = any> {
  parent: any;
  args: Record<string, any>;
  context: any;
  info: GraphQLResolveInfo;
}

export type OnnBeforeGql = <T>(resolverName: string, gqlParams: GqlParams) => { value: T | null, gqlParams: GqlParams } | null;
export type OnnAfterGql = <T>(resolverName: string, result: T, gqlParams: GqlParams) => T;

export class OnnDdlToGql<GraphQLResolveInfo = any> {
  constructor(queryBuilderFactory: <T extends {}>() => QueryBuilder<T>, options?: { onnBeforeGql?: OnnBeforeGql; onnAfterGql?: OnnAfterGql }) {
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
}

__FACTORY__
`

export const knexFactrory = `import { Knex } from 'knex';

export const knexQueryBuilderFactory = (knex: Knex) => <T extends {}>() => new KnexQueryBuilder<T>(knex);

export class KnexQueryBuilder<TYPE extends {}> implements QueryBuilder<TYPE, Knex> {
  private options: {
    table: string;
    where: { field: string; value: any }[];
    whereIn: { field: string; values: any[] }[];
    limit?: number;
    offset?: number;
    select?: string | string[];
  } = {
    table: '',
    where: [],
    whereIn: [],
  };

  constructor(private knex: Knex) {}

  private build(): Knex.QueryBuilder<TYPE> {
    let qb = this.knex<TYPE>(this.options.table) as Knex.QueryBuilder<TYPE>;
    this.options.where.forEach((where) => (qb = qb.where(where.field, where.value)));
    this.options.whereIn.forEach((whereIn) => (qb = qb.whereIn(whereIn.field, whereIn.values)));
    return qb;
  }

  execute(): Promise<TYPE[]> {
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
    return qb;
  }

  async executeCount(): Promise<number> {
    const count = await this.build().count();
    return count[0]['count(*)'] as number;
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

  where(field: string, value: any): QueryBuilder<TYPE, Knex> {
    this.options.where.push({ field, value });
    return this;
  }

  whereIn(field: string, values: any[]): QueryBuilder<TYPE, Knex> {
    this.options.whereIn.push({ field, values });
    return this;
  }
}

`
