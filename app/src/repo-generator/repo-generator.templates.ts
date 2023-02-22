export const baseRepo = `
import { Knex } from 'knex';
import * as model from './model';

export abstract class SQL_Base_Repo<SQL_TYPE extends {}> {

  static knex: Knex;

  protected constructor(private tableName: string) {}

  builder = () => SQL_Base_Repo.knex<SQL_TYPE>(this.tableName) as Knex.QueryBuilder<SQL_TYPE>;

  paginate = async (
    qb: Knex.QueryBuilder<SQL_TYPE>,
    paginate: model.Paginate
  ): Promise<model.Paginated<SQL_TYPE>> => {
    const count = await qb.clone().count();
    const totalEntries = count[0]['count(*)'] as number;
    
    const noLimit = paginate.pageSize <= 0;
    const data = await (noLimit ? qb : qb.offset(paginate.pageIndex * paginate.pageSize).limit(paginate.pageSize));

    return {
      pageIndex: noLimit ? 0 : paginate.pageIndex,
      pageSize: noLimit ? totalEntries : paginate.pageSize,
      totalEntries,
      data: data,
    };
  };
}
`;

export const byGetterBlock = `
  async get___SQL_TYPE____by____SAFE_FIELD_NAME__(
    __SAFE_FIELD_NAME__: string,
    fields: string | string[] = '*'
  ): Promise<model.__SQL_TYPE__> {
    const res = await this.builder().select(fields).where('__FIELD_NAME__', __SAFE_FIELD_NAME__);
    return res[0]; // model.__SQL_TYPE__
  }  
`;

export const byPaginatedGetterBlock = `
  async getPaginated___FOREIGN_SQL_TYPE____by____SAFE_FOREIGN_FIELD_NAME__(
    __SAFE_FOREIGN_FIELD_NAME__: string,
    paginate?: model.Paginate | null,
    fields: string | string[] = '*'
  ): Promise<model.Paginated<model.__FOREIGN_SQL_TYPE__>> {
    return await new __FOREIGN_SQL_TYPE___Repo().getPaginated(paginate, fields, (qb) => qb.where('__FOREIGN_FIELD_NAME__', __SAFE_FOREIGN_FIELD_NAME__));
  }  
`;

export const repoTemplate = `
export class __SQL_TYPE___Repo extends SQL_Base_Repo<model.__SQL_TYPE__> {
  constructor() {
    super('__SQL_TABLE__');
  }  
  __FIELD_GETTER_BLOCK__
  
  __PAGINATED_FIELD_GETTER_BLOCK__
  
  async getPaginated(
    paginate?: model.Paginate | null,
    fields: string | string[] = '*',
    builder: (qb: Knex.QueryBuilder) => Knex.QueryBuilder = qb => qb
  ): Promise<model.Paginated<model.__SQL_TYPE__>> {
    const queryBuilder = builder(this.builder().select(fields));
    return this.paginate(queryBuilder, paginate ?? { pageIndex: -1, pageSize: -1 });
  }
}

`;
