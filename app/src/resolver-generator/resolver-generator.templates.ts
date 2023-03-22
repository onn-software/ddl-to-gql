export const baseResolver = `
import * as model from './model';
import * as repo from './repos';

export class OnnResolverHooks {
  static before: <T, E = any>(resolverName:string, gqlParams: any) => Promise<{ value: T | null, gqlParams: any, extras?: E } | null> = async () => null;
  static after: <T, E = any>(resolverName:string, result: T, gqlParams: any, extras?: E) => Promise<T> = async (_, result) => result;
}

export const mapClauses: (clauses?: any[]) => model.Clause[] = clauses => {
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

export const typeResolvers = `
export const allGqlTypeResolvers = {
    __RESOLVER_ENTRIES__
};
`

export const getResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: any, info: any) => {
    let gqlParams = { parent, args, context, info };
    const b = await OnnResolverHooks.before<model.__FOREIGN_SQL_TYPE__>("__RELATION_NAME__", gqlParams);
    if (b?.value) { return b.value; }
    if (b?.gqlParams) { gqlParams = b.gqlParams; }
    
    const clauses = [{field: "__SAFE_FOREIGN_FIELD_NAME__", value: gqlParams.parent["__SAFE_FIELD_NAME__"], operator: model.QueryOperator.EQUALS}, ...mapClauses(gqlParams.args.where)];
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getBy(gqlParams.context, clauses, gqlParams.args.orderBy);
    return (await OnnResolverHooks.after("__RELATION_NAME__", result, gqlParams, b?.extras)) as any;
  },
`;


export const paginatedResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: any, info: any) => {
    let gqlParams = { parent, args, context, info };
    const b = await OnnResolverHooks.before<model.Paginated<model.__FOREIGN_SQL_TYPE__>>("__RELATION_NAME__", gqlParams);
    if (b?.value) { return b.value; }
    if (b?.gqlParams) { gqlParams = b.gqlParams; }
    
    const clauses = [{field: "__SAFE_FOREIGN_FIELD_NAME__", value: gqlParams.parent["__SAFE_FIELD_NAME__"], operator: model.QueryOperator.EQUALS}, ...mapClauses(gqlParams.args.where)];
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getPaginatedBy(gqlParams.context, clauses, gqlParams.args.paginate, gqlParams.args.orderBy);
    return (await OnnResolverHooks.after("__RELATION_NAME__", result, gqlParams, b?.extras)) as any;
  },
`;

export const queryResolverEntry = `
  __TABLE_NAME__: async (parent: any, args: any, context: any, info: any) => {
    let gqlParams = { parent, args, context, info };
    const b = await OnnResolverHooks.before<model.Paginated<model.__SQL_TYPE__>>("__TABLE_NAME__", gqlParams);
    if (b?.value) { return b.value; }
    if (b?.gqlParams) { gqlParams = b.gqlParams; }
    
    const result = await new repo.__SQL_TYPE___Repo().getPaginatedBy(gqlParams.context, mapClauses(gqlParams.args.where), gqlParams.args.paginate, gqlParams.args.orderBy);
    return (await OnnResolverHooks.after("__TABLE_NAME__", result, gqlParams, b?.extras)) as any;
  },
 `
export const mutationResolverEntry = `
  __MUTATION_TYPE_____TABLE_NAME__: async (parent: any, args: any, context: any, info: any) => {
    let gqlParams = { parent, args, context, info };
    const b = await OnnResolverHooks.before<model.Paginated<model.__SQL_TYPE__>>("__MUTATION_TYPE_____TABLE_NAME__", gqlParams);
    if (b?.value) { return b.value; }
    if (b?.gqlParams) { gqlParams = b.gqlParams; }
    
    const result = await new repo.__SQL_TYPE___Repo().__MUTATION_TYPE__By(gqlParams.context, mapClauses(gqlParams.args.where), gqlParams.args.value);
    return (await OnnResolverHooks.after("__MUTATION_TYPE_____TABLE_NAME__", result, gqlParams, b?.extras)) as any;
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
