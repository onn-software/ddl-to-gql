export const baseRepo = `import * as model from './model';

export abstract class OnnBaseRepo<SQL_TYPE extends {}> {

  static BUILDER_FACTORY: <T extends {}>() => model.QueryBuilder<T> = () => {
    throw new Error('No BUILDER_FACTORY set')
  };

  protected constructor(private tableName: string) {}

  builder = () => OnnBaseRepo.BUILDER_FACTORY<SQL_TYPE>().table(this.tableName);

  paginate = async (
    qb: model.QueryBuilder<SQL_TYPE>,
    fields: string | string[] = '*',
    paginate: model.Paginate
  ): Promise<model.Paginated<SQL_TYPE>> => {
    const totalEntries = await qb.executeCount();
    
    const noLimit = paginate.pageSize <= 0;
    const query = noLimit ? qb.select(fields) : qb.select(fields).offset(paginate.pageIndex * paginate.pageSize).limit(paginate.pageSize);
    const data = await query.execute();

    return {
      pageIndex: noLimit ? 0 : paginate.pageIndex,
      pageSize: noLimit ? totalEntries : paginate.pageSize,
      totalEntries,
      data: data,
    };
  };
}

`;

export const repoTemplate = `export class __SQL_TYPE___Repo extends OnnBaseRepo<model.__SQL_TYPE__> {
  constructor() {
    super('__SQL_TABLE__');
  }
  
  async getBy(
    key: (__UNIQUE_FIELDS__),
    value: any,
    fields: string | string[] = '*'
  ): Promise<model.__SQL_TYPE__> {
    const [res] = await this.builder().select(fields).where(key, value).execute() as any;
__MAPPERS__
    return res;
  }

  async getPaginatedBy(
    clauses: { key: (__NON_UNIQUE_FIELDS__) ; values: any[] }[],
    paginate?: model.Paginate | null,
    fields: string | string[] = '*',
    builder: (qb: model.QueryBuilder<model.__SQL_TYPE__>) => model.QueryBuilder<model.__SQL_TYPE__> = qb => qb
  ): Promise<model.Paginated<model.__SQL_TYPE__>> {
    const queryBuilder = clauses.reduce((qb, c) => qb.whereIn(c.key, c.values), this.builder())
    const paginated = await this.paginate(builder(queryBuilder), fields, paginate ?? { pageIndex: -1, pageSize: -1 });
__PAGINATED_MAPPERS__
    return paginated;
  }
}

`;
