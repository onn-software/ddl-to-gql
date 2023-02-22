import {knexFactrory, main} from './main-generator.template';

export class MainGenerator {
  execute(sqlLibrary: string | 'knex' = ''): string {

    const lookup: Record<string, string> = {
      knex: knexFactrory
    }

    return main.replaceAll('__FACTORY__', lookup[sqlLibrary] ?? '');
  }
}
