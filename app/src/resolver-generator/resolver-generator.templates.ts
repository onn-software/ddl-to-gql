export const baseResolver = `
import * as model from './model';
import * as repo from './repos';

export class OnnResolverHooks {
  static buildWrapper : () => {
   before: <T, E = any>(resolverName:string, gqlParams: any) => Promise<T | undefined | null>;
   after: <T, E = any>(resolverName:string, result: T, gqlParams: any) => Promise<T>;
 } = () => ({
    before: async () => null,
    after: async (_,result) => result,
  });
}

export const mapClauses: <T = any>(clauses?: any[]) => model.Clause<T>[] = clauses => {
  return (clauses ?? []).map(c => ({field: c.field, operator: c.operator, value:
    c.booleanValue ?? c.intValue ?? c.floatValue ?? c.stringValue ?? c.intValues ?? c.floatValues ?? c.stringValues}))
}
`;

export const resolverTemplate = `

export const __GQL_TYPE___Resolver = {
    __FIELD_GETTER_BLOCK__
    __PAGINATED_FIELD_GETTER_BLOCK__
};
`;

export const getResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: model.OnnContext, info: any) => {
    let gqlParams = { parent, args, context, info };
    const wrapper = OnnResolverHooks.buildWrapper();
    const value = await wrapper.before<model.__FOREIGN_SQL_TYPE__>("__RELATION_NAME__", gqlParams);
    if (value) { return value; }
    
    const clauses = [{field: "__SAFE_FOREIGN_FIELD_NAME__", value: gqlParams.parent["__SAFE_FIELD_NAME__"], operator: model.QueryOperator.EQUALS}, ...mapClauses(gqlParams.args.where)];
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getBy(gqlParams.context, clauses, gqlParams.args.orderBy);
    return (await wrapper.after("__RELATION_NAME__", result, gqlParams)) as any;
  },
`;

export const paginatedResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: model.OnnContext, info: any) => {
    let gqlParams = { parent, args, context, info };
    const wrapper = OnnResolverHooks.buildWrapper();
    const value = await wrapper.before<model.Paginated<model.__FOREIGN_SQL_TYPE__>>("__RELATION_NAME__", gqlParams);
    if (value) { return value; }
    
    const clauses = [{field: "__SAFE_FOREIGN_FIELD_NAME__", value: gqlParams.parent["__SAFE_FIELD_NAME__"], operator: model.QueryOperator.EQUALS}, ...mapClauses(gqlParams.args.where)];
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getPaginatedBy(gqlParams.context, clauses, gqlParams.args.paginate, gqlParams.args.orderBy);
    return (await wrapper.after("__RELATION_NAME__", result, gqlParams)) as any;
  },
`;

export const queryResolverEntry = `
  __TABLE_NAME__: async (parent: any, args: any, context: model.OnnContext, info: any) => {
    let gqlParams = { parent, args, context, info };
    const wrapper = OnnResolverHooks.buildWrapper();
    const value = await wrapper.before<model.Paginated<model.__SQL_TYPE__>>("__TABLE_NAME__", gqlParams);
    if (value) { return value; }
    
    const result = await new repo.__SQL_TYPE___Repo().getPaginatedBy(gqlParams.context, mapClauses(gqlParams.args.where), gqlParams.args.paginate, gqlParams.args.orderBy);
    return (await wrapper.after("__TABLE_NAME__", result, gqlParams)) as any;
  },
 `
export const mutationResolverEntry = `
  __MUTATION_TYPE_____TABLE_NAME__: async (parent: any, args: any, context: model.OnnContext, info: any) => {
    let gqlParams = { parent, args, context, info };
    const wrapper = OnnResolverHooks.buildWrapper();
    const value = await wrapper.before<model.Paginated<model.__SQL_TYPE__>>("__MUTATION_TYPE_____TABLE_NAME__", gqlParams);
    if (value) { return value; }
    
    const result = await new repo.__SQL_TYPE___Repo().__MUTATION_TYPE__By(gqlParams.context, mapClauses(gqlParams.args.where), gqlParams.args.value);
    return (await wrapper.after("__MUTATION_TYPE_____TABLE_NAME__", result, gqlParams)) as any;
  },
 `

export const queryResolvers = `
export const allGqlQueryResolvers = {
__RESOLVER_ENTRIES__
};
`


export const mutationResolvers = `
export const allGqlMutationResolvers = {
__MUTATION_ENTRIES__
};
`
