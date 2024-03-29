
export const baseGql = `
input Paginate {
  pageIndex: Int!,
  pageSize: Int!,
}

enum OrderDirection {
  asc
  desc
}

enum MutationAction {
  insert
  upsert
  update
  delete
}

input OrderBy {
  field: String!,
  direction: OrderDirection!,
}

enum ClauseOperator  {
  EQUALS
  IN
  BETWEEN
  LIKE
  NULL
  NOT_EQUALS
  NOT_IN
  NOT_BETWEEN
  NOT_NULL
}

input WhereClause {
  field: String!
  operator: ClauseOperator!
  booleanValue: Boolean
  intValue: Int
  floatValue: Float
  stringValue: String
  intValues: [Int!]
  floatValues: [Float!]
  stringValues: [String!]
}

type MutationResult {
    res: String!
    rows: Int!
    error: String
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
    DOUBLE: 'Float',
    NUMERIC: 'Float',
    FLOAT: 'Float',
    REAL: 'Float',
};
