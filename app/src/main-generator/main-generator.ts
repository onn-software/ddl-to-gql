import {knexFactrory, main} from './main-generator.template';

export class MainGenerator {
  execute(sqlLibrary: string | 'knex' = '', gqlNoRoot:boolean = false): string {

    const lookup: Record<string, string> = {
      knex: knexFactrory
    }

    let res = main.replaceAll('__FACTORY__', lookup[sqlLibrary] ?? '');

    if(gqlNoRoot) {
      res = res
          .replace('getAllQueryResolvers = () => allGqlQueryResolvers;', 'getAllQueryResolvers = () => () => ({} as any);')
          .replace('getAllGqlMutationResolvers = () => allGqlMutationResolvers;', 'getAllGqlMutationResolvers = () => () => ({} as any);')
    }

    return res;
  }
}
