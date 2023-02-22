# ddl-to-gql
Convert a SQL DDL to a GraphQL implementation with all relations.

## Code generation

The _Data Description Language_ (DDL) is intended to be a SQL dialect independent language to describe how a database looks like.
For the sake of [@onn-software/ddl-to-gql](https://www.npmjs.com/package/@onn-software/ddl-to-gql), we only care about the contents of `CREATE TABLE`

```mysql
CREATE TABLE `tableName`
(
    `id`            int             PRIMARY KEY ,
    someField       varchar(50)     NOT NULL,
    `1uglyName`     bool            NULL,
    CONSTRAINT      `myConstraint`  FOREIGN KEY (`id`) REFERENCES `anotherTable` (`anotherId`)
)
```

Based on a valid DDL file a complete Graph is created, respecting the `FOREIGN KEY` relations. 
A complete GraphQL setup is generated.

```npm
npx @onn-software/ddl-to-gql \
    --ddlPath="./my.ddl" \
    --defPath="./table-definitions.json" \
    --tsFolder="src/gen/onn/ts" \
    --gqlFolder="src/gen/onn/gql" \
    --sqlFactory="knex"
```

## Integrate in Yoga/Apollo GraphQL
You should bhe familiar with setting up an Apollo GraphQL server, in case you're not fully up to speed, take a look at [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server). 
It's an easy way to get started with Apollo GraphQL server, our example uses it as well. 

Once you have your server running, add the following to your existing initialisation.

```typescript
import {knexQueryBuilderFactory, OnnDdlToGql} from './gen/onn/ts';
...
const typeDef = loadSchemaSync([ 
        join(__dirname, './gql/*.graphql'), 
        join(__dirname, './gen/onn/gql/*.graphql') // Add the generated .graphql to your initalization
    ], { loaders: [new GraphQLFileLoader()] }
);

const onnDdlToGql = new OnnDdlToGql<GraphQLResolveInfo>(knexQueryBuilderFactory(knex(config)));

const root: Resolvers = {
    ...onnDdlToGql.getAllTypeResolvers(),
    Query: {
        ...onnDdlToGql.getAllQueryResolvers(),
    }
};

const schema = makeExecutableSchema({
    resolvers: [root],
    typeDefs: [typeDef]
});
...
```

In this example we use [Knex.js](https://knexjs.org/) to connect to the database. 
We are agnostic from the SQL layer, by implementing our `QueryBuilder` interface any database can be connected.
In the future we want to support more databases out of the box, but as od now we only supply a `QueryBuilder` for knex.

Take a look at our example how to set up Knex.

## Run the example

We provide a complete example for you to run locally, [read more](https://github.com/onn-software/ddl-to-gql/tree/main/example).

When it's running, you can explore the data set via [Yoga GraphiQL](http://localhost:4000/graphql), it'll look like:

![ExampleResult](ExampleResult.png)

## Get the DDL via Adminer

The exmaple uses Adminer for a quick and easy DB overview. You can use any tool to obtain the DDL, IntelliJ has plugins ,VS Code has plugins, there are dedicated SQL tools, or perhaps your database is provisioned from code by having the DDL committed to the repo.

One way to get it is via the Adminer UI:

![How to DDL](AdminerDDL.png)

## Licence

By David Hardy and [Onn Software](https://onn.software):

```
The MIT License

Copyright (c) 2023 David Hardy
Copyright (c) 2023 Onn Software

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
