export const baseRepo = `import { Knex } from 'knex';
import * as model from './model';

export abstract class SQL_Base_Repo<SQL_TYPE extends {}> {

  static knex: Knex;

  protected constructor(private tableName: string) {}

  builder = () => SQL_Base_Repo.knex<SQL_TYPE>(this.tableName) as Knex.QueryBuilder<SQL_TYPE>;

  paginate = async (
    qb: Knex.QueryBuilder<SQL_TYPE>,
    fields: string | string[] = '*',
    paginate: model.Paginate
  ): Promise<model.Paginated<SQL_TYPE>> => {
    const count = await qb.clone().count();
    const totalEntries = count[0]['count(*)'] as number;
    
    const noLimit = paginate.pageSize <= 0;
    const data = await (noLimit ? qb.select(fields) : qb.select(fields).offset(paginate.pageIndex * paginate.pageSize).limit(paginate.pageSize));

    return {
      pageIndex: noLimit ? 0 : paginate.pageIndex,
      pageSize: noLimit ? totalEntries : paginate.pageSize,
      totalEntries,
      data: data,
    };
  };
}
`;

export const repoTemplate = `export class __SQL_TYPE___Repo extends SQL_Base_Repo<model.__SQL_TYPE__> {
  constructor() {
    super('__SQL_TABLE__');
  }
  
  async getBy(
    key: (__UNIQUE_FIELDS__),
    value: any,
    fields: string | string[] = '*'
  ): Promise<model.__SQL_TYPE__> {
    const res = await this.builder().select(fields).where(key, value);
    return res[0];
  }

  async getPaginatedBy(
    clauses: { key: (__NON_UNIQUE_FIELDS__) ; values: any[] }[],
    paginate?: model.Paginate | null,
    fields: string | string[] = '*',
    builder: (qb: Knex.QueryBuilder) => Knex.QueryBuilder = qb => qb
  ): Promise<model.Paginated<model.__SQL_TYPE__>> {
    const queryBuilder = clauses.reduce((qb, c) => qb.whereIn(c.key, c.values), this.builder())
    return this.paginate(builder(queryBuilder), fields, paginate ?? { pageIndex: -1, pageSize: -1 });
  }
}

`;
