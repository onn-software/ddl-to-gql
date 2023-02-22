import {loadSchemaSync} from '@graphql-tools/load';
import {GraphQLFileLoader} from '@graphql-tools/graphql-file-loader';
import {join} from 'node:path';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {createYoga} from 'graphql-yoga';
import {createServer} from 'http';
import {OnnDdlToGql} from './gen/onn/ts';
import {Onn_customers_Repo, SQL_Base_Repo} from './gen/onn/ts/repos';
import knex, {Knex} from 'knex';
import {QueryCustomersArgs, Resolvers} from './gen/gql/resolvers-types';
import {GraphQLResolveInfo} from 'graphql';

require('dotenv').config({path: '../env/dev/.env'});

const main = async () => {
    const typeDef = loadSchemaSync(
        [join(__dirname, './gql/*.graphql'), join(__dirname, './gen/onn/gql/*.graphql')],
        {
            loaders: [new GraphQLFileLoader()]
        }
    );

    const config: Knex.Config = {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'example',
            database: 'classicmodels'
        }
    };


    SQL_Base_Repo.knex = knex(config);
    const onnDdlToGql = new OnnDdlToGql<GraphQLResolveInfo>();
    
    const root: Resolvers = {
        ...onnDdlToGql.getAllTypeResolvers(),
        Query: {
            ...onnDdlToGql.getAllQueryResolvers(),
            version: () => 'Dev',
        }
    };
    const schema = makeExecutableSchema({
        resolvers: [root],
        typeDefs: [typeDef]
    });

    const yoga = createYoga({schema});
    const server = createServer(yoga);

    server.listen(4000, () => {
        console.info('Server is running on http://localhost:4000/graphql');
    });
};

main().then();
