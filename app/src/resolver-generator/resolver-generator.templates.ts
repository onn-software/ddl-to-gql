export const baseResolver = `
import * as model from './model';
import * as repo from './repos';

export class OnnResolverHooks {
  static before: <T>(gqlParams: any) => T | null = () => null;
  static after: <T>(result: T, gqlParams: any) => T = (result) => result;
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
    const b = OnnResolverHooks.before<model.__FOREIGN_SQL_TYPE__>({ parent, args, context, info });
    if (b) {
      return b;
    }
    
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getBy("__SAFE_FOREIGN_FIELD_NAME__", parent["__SAFE_FIELD_NAME__"]);
    return OnnResolverHooks.after(result, {parent, args, context, info}) as any;
  },
`;


export const paginatedResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: any, info: any) => {
    const b = OnnResolverHooks.before<model.Paginated<model.__FOREIGN_SQL_TYPE__>>({ parent, args, context, info });
    if (b) {
      return b;
    }
    
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().getPaginatedBy([{key: "__SAFE_FOREIGN_FIELD_NAME__", values: [parent["__SAFE_FIELD_NAME__"]]}], args.paginate);
    return OnnResolverHooks.after(result, {parent, args, context, info}) as any;
  },
`;

export const queryResolverEntry = `  __TABLE_NAME__: (_: any, args: any) => new repo.__SQL_TYPE___Repo().getPaginatedBy([], args.paginate) as any,`

export const queryResolvers = `
export const allGqlQueryResolvers = {
__RESOLVER_ENTRIES__
};
`
