
export const baseGql = `
input Paginate {
  pageIndex: Int!,
  pageSize: Int!,
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
