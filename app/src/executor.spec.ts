import { Executor } from './executor';
import { DdlInterpreter } from './ddl-interpreter/ddl-interpreter';
import { ResolverGenerator } from './resolver-generator/resolver-generator';
import { RepoGenerator } from './repo-generator/repo-generator';
import { ModelGenerator } from './model-generator/model-generator';
import {MainGenerator} from './main-generator/main-generator';
import {SchemaGenerator} from './schema-generator/schema-generator';

describe('Executor', () => {
  it('executes all phases when array is empty', async () => {
    new Executor(
      new DdlInterpreter(),
      new ModelGenerator(),
      new RepoGenerator(),
      new ResolverGenerator(),
      new SchemaGenerator(),
      new MainGenerator()
    ).execute({
      phases: [],
      ddlPath: './src/ddl-interpreter/__stubs__/interpret-test.ddl',
      defPath: './table-definitions.json',
      tsFolder: 'test/ts',
      gqlFolder: 'test/gql',
      overrideDest: true
    });
  });
  it('executes all phases when array is empty -- example', async () => {
    new Executor(
      new DdlInterpreter(),
      new ModelGenerator(),
      new RepoGenerator(),
      new ResolverGenerator(),
      new SchemaGenerator(),
      new MainGenerator()
    ).execute({
      phases: [],
      ddlPath: './src/ddl-interpreter/__stubs__/interpret-test.ddl',
      defPath: './table-definitions.json',
      tsFolder: '/Users/hardy/Development/Onn/ddl-to-gql/example/src/gen/onn/ts',
      gqlFolder: '/Users/hardy/Development/Onn/ddl-to-gql/example/src/gen/onn/gql',
      overrideDest: true,
      sqlFactory: 'knex'
    });
  });
});
