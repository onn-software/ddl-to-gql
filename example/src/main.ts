import { loadSchemaSync } from "@graphql-tools/load";
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { join } from "node:path";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createYoga } from "graphql-yoga";
import { createServer } from "http";
import { knexQueryBuilderFactory, OnnDdlToGql } from "./gen/onn/ts";
import knex, { Knex } from "knex";
import { Resolvers } from "./gen/gql/resolvers-types";
import { GraphQLResolveInfo } from "graphql";

require("dotenv").config({ path: "../env/dev/.env" });

const main = async () => {
  // The code generator is agnostic from the actual SQL implementation.
  // However, the example needs an actual SQL layer, for this we chose Knex:S
  // Run: `npm install knex mysql2`

  const config: Knex.Config = {
    client: "mysql2",
    connection: {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "example",
      database: "classicmodels",
    },
  };

  // loadSchemaSync is a helper functions part of graphql-tools and used for graphql-yoga
  // Make sure you supply correct paths for any of your own *.graphql AND the generated *.graphql file.

  const typeDef = loadSchemaSync(
    [
      join(__dirname, "./gql/*.graphql"),
      join(__dirname, "./gen/onn/gql/*.graphql"), // This is the generated file
    ],
    { loaders: [new GraphQLFileLoader()] }
  );

  // Here we instantiate our library, supplying the SQL connection.
  // Any other SQL library can be used, just supply a builder for it.
  // In the future we might supply more out of the box implementations, please request one if needed.

  const onnDdlToGql = new OnnDdlToGql<GraphQLResolveInfo>(
    knexQueryBuilderFactory(knex(config))
  );

  // Supply the generated resolvers. In this example we used @graphql-codegen to generate types
  // based on the *.graphql files. This is not required.

  const root: Resolvers = {
    ...onnDdlToGql.getAllTypeResolvers(),
    Query: {
      version: () => "Dev",
      onn: async () => ({} as any)
    },
    Mutation: {
      onn: async () => ({} as any)
    },
  };

  // Finish initializing and start the Yoga server, we're done!

  const schema = makeExecutableSchema({
    resolvers: [root],
    typeDefs: [typeDef],
  });

  const yoga = createYoga({ schema });
  const server = createServer(yoga);

  server.listen(4000, () => {
    console.info("Server is running on http://localhost:4000/graphql");
  });
};

main().then();
