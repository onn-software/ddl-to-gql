
export const baseGql = `
input Paginate {
  pageIndex: Int!,
  pageSize: Int!,
}

enum OrderDirection {
  asc
  desc
}

input OrderBy {
  field: String!,
  direction: OrderDirection!,
}

`;

export const GqlTypeMap: Record<string, string> = {
    // any: 'String',
    BIT: 'Boolean',
    TINYINT: 'Int',
    SMALLINT: 'Int',
    INT: 'Int',
    BIGINT: 'Int',
    DECIMAL: 'Float',
    NUMERIC: 'Float',
    FLOAT: 'Float',
    REAL: 'Float',
};
