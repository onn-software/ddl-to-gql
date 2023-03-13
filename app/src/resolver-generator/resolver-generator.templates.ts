export const baseResolver = `
import * as model from './model';
import * as repo from './repos';

export class OnnResolverHooks {
  static before: <T>(resolverName:string, gqlParams: any) => Promise<{ value: T | null, gqlParams: any } | null> = async () => null;
  static after: <T>(resolverName:string, result: T, gqlParams: any) => Promise<T> = async (_, result) => result;
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
    
    const clauses = [{field: "__SAFE_FOREIGN_FIELD_NAME__", value: gqlParams.parent["__SAFE_FIELD_NAME__"], operator: model.QueryOperator.EQUALS}];
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getBy(clauses, gqlParams.args.orderBy);
    return (await OnnResolverHooks.after("__RELATION_NAME__", result, gqlParams)) as any;
  },
`;


export const paginatedResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: any, info: any) => {
    let gqlParams = { parent, args, context, info };
    const b = await OnnResolverHooks.before<model.Paginated<model.__FOREIGN_SQL_TYPE__>>("__RELATION_NAME__", gqlParams);
    if (b?.value) { return b.value; }
    if (b?.gqlParams) { gqlParams = b.gqlParams; }
    
    const clauses = [{field: "__SAFE_FOREIGN_FIELD_NAME__", value: gqlParams.parent["__SAFE_FIELD_NAME__"], operator: model.QueryOperator.EQUALS}];
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getPaginatedBy(clauses, gqlParams.args.paginate, gqlParams.args.orderBy);
    return (await OnnResolverHooks.after("__RELATION_NAME__", result, gqlParams)) as any;
  },
`;

export const queryResolverEntry = `
  __TABLE_NAME__: async (parent: any, args: any, context: any, info: any) => {
    let gqlParams = { parent, args, context, info };
    const b = await OnnResolverHooks.before<model.Paginated<model.__SQL_TYPE__>>("__TABLE_NAME__", gqlParams);
    if (b?.value) { return b.value; }
    if (b?.gqlParams) { gqlParams = b.gqlParams; }
    
    const result = await new repo.__SQL_TYPE___Repo().getPaginatedBy([], gqlParams.args.paginate, gqlParams.args.orderBy);
    return (await OnnResolverHooks.after("__TABLE_NAME__", result, gqlParams)) as any;
  },
 `

export const queryResolvers = `
export const allGqlQueryResolvers = {
__RESOLVER_ENTRIES__
};
`
