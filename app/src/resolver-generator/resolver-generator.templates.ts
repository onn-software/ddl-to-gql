export const baseResolver = `
import { GraphQLResolveInfo } from 'graphql';
import * as model from './model';
import * as repo from './repos';

export interface GqlParams {
  parent: any;
  args: Record<string, any>; 
  context: any;
  info: GraphQLResolveInfo;
}

export class SQL_Resolvers {
  static before: <T>(gqlParams: GqlParams) => T | null = () => null;
  static after: <T>(result: T, gqlParams: GqlParams) => T = (result) => result;
}
`;

export const resolverTemplate = `

export const __GQL_TYPE___Resolver = {
    __FIELD_GETTER_BLOCK__
    __PAGINATED_FIELD_GETTER_BLOCK__
};
`;

export const getResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: any, info: GraphQLResolveInfo) => {
    const b = SQL_Resolvers.before<model.__FOREIGN_SQL_TYPE__>({ parent, args, context, info });
    if (b) {
      return b;
    }
    
    const result = await new repo.__FOREIGN_SQL_TYPE___Repo().get___FOREIGN_SQL_TYPE____by____SAFE_FOREIGN_FIELD_NAME__(parent["__SAFE_FIELD_NAME__"]);
    return SQL_Resolvers.after(result, {parent, args, context, info}) as any;
  },
`;

export const paginatedResolverBlock = `
  __RELATION_NAME__: async (parent: any, args: any, context: any, info: GraphQLResolveInfo) => {
    const b = SQL_Resolvers.before<model.__FOREIGN_SQL_TYPE__>({ parent, args, context, info });
    if (b) {
      return b;
    }
    
    const result = await new repo.__SQL_TYPE___Repo().get_Paginated___FOREIGN_SQL_TYPE____by____SAFE_FOREIGN_FIELD_NAME__(parent["__SAFE_FIELD_NAME__"], args.paginate);
    return SQL_Resolvers.after(result, {parent, args, context, info}) as any;
  },
`;
