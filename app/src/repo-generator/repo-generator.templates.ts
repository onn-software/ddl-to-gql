export const baseRepo = `import * as model from './model';

export abstract class OnnBaseRepo<SQL_TYPE extends {}> {

  static BUILDER_FACTORY: <T extends {}>(context: any) => model.QueryBuilder<T> = (context) => {
    throw new Error('No BUILDER_FACTORY set')
  };

  protected constructor(private tableName: string) {}

  builder = (context: any) => OnnBaseRepo.BUILDER_FACTORY<SQL_TYPE>(context).table(this.tableName);

  paginate = async (
    qb: model.QueryBuilder<SQL_TYPE>,
    fields: string[] = ['*'],
    paginate: model.Paginate,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
  ): Promise<model.Paginated<SQL_TYPE>> => {
    const totalEntries = await qb.executeCount();
    
    const _qb = qb.select(fields).orderBy(orderBy);
    const noLimit = paginate.pageSize <= 0;
    const query = noLimit ? _qb : _qb.offset(paginate.pageIndex * paginate.pageSize).limit(paginate.pageSize);
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

export const repoTemplate = `
__UNSAFE_LOOKUP__
export class __SQL_TYPE___Repo extends OnnBaseRepo<model.__SQL_TYPE__> {
  constructor() {
    super('__SQL_TABLE__');
  }
  
  async getBy(
    context: any,
    clauses: model.Clause[],
    value: any,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    fields: string[] = ['*'],
  ): Promise<model.__SQL_TYPE__> {
__UNSAFE_MAPPERS__
    const [res] = await this.builder(context)
        .select(fields)
        .where(...clauses)
        .orderBy(orderBy).execute() as any;
__SAFE_MAPPERS__
    return res;
  }

  async getPaginatedBy(
    context: any,
    clauses: model.Clause[],
    paginate?: model.Paginate | null,
    orderBy?: { field: string, direction: 'asc' | 'desc' },
    fields: string[] = ['*'],
    builder: (qb: model.QueryBuilder<model.__SQL_TYPE__>) => model.QueryBuilder<model.__SQL_TYPE__> = qb => qb
  ): Promise<model.Paginated<model.__SQL_TYPE__>> {  
__UNSAFE_MAPPERS__
__UNSAFE_PAGINATED_MAPPERS__
    const queryBuilder = this.builder(context).where(...clauses);
    const paginated = await this.paginate(builder(queryBuilder), fields, paginate ?? { pageIndex: -1, pageSize: -1 }, orderBy);
__SAFE_PAGINATED_MAPPERS__
    return paginated;
  }
}

`;
