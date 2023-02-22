export const main = `import {allGqlQueryResolvers, allGqlResolvers, OnnResolverHooks} from './resolvers';

export interface GqlParams<GraphQLResolveInfo = any> {
  parent: any;
  args: Record<string, any>;
  context: any;
  info: GraphQLResolveInfo;
}

export type OnnBefore = <T>(gqlParams: GqlParams) => T | null;
export type OnnAfter = <T>(result: T, gqlParams: GqlParams) => T;

export class OnnDdlToGql<GraphQLResolveInfo = any> {
  static init(options?: { onnBefore?: OnnBefore; onnAfter?: OnnAfter }) {
    if (options?.onnBefore) {
      OnnResolverHooks.before = options.onnBefore;
    }
    if (options?.onnAfter) {
      OnnResolverHooks.after = options.onnAfter;
    }
  }

  getAllTypeResolvers = () => allGqlResolvers;
  getAllQueryResolvers = () => allGqlQueryResolvers;
}
`
