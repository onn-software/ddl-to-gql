import { Executor } from './executor';
import { DdlInterpreter } from './ddl-interpreter/ddl-interpreter';
import { ResolverGenerator } from './resolver-generator/resolver-generator';
import { RepoGenerator } from './repo-generator/repo-generator';
import { ModelGenerator } from './model-generator/model-generator';
import { MainGenerator } from './main-generator/main-generator';
import { SchemaGenerator } from './schema-generator/schema-generator';
import { HeuristicEngine } from './heuristics/heuristic-engine';

describe('Executor', () => {
  it('executes all phases when array is empty', async () => {
    new Executor(
      new DdlInterpreter(),
      new HeuristicEngine(),
      new ModelGenerator(),
      new RepoGenerator(),
      new ResolverGenerator(),
      new SchemaGenerator(),
      new MainGenerator()
    ).execute({
      phases: [],
      ddlPath: './src/ddl-interpreter/__stubs__/interpret-test.ddl',
      heurPath: './test/executor/heuristics.json',
      heurSuffixes: "id,code,number",
      heurEnableAll:true,
      defPath: './test/executor/table-definitions.json',
      tsFolder: 'test/executor/ts',
      gqlFolder: 'test/executor/gql',
      override: true,
    });
  });
  it('executes all phases when array is empty -- example', async () => {
    new Executor(
      new DdlInterpreter(),
      new HeuristicEngine(),
      new ModelGenerator(),
      new RepoGenerator(),
      new ResolverGenerator(),
      new SchemaGenerator(),
      new MainGenerator()
    ).execute({
      phases: [],
      ddlPath: '/Users/hardy/Development/Onn/ddl-to-gql/example/example.ddl',
      ddlOverridesPath: './overrides.json',
      heurPath: './heuristic.json',
      heurSuffixes: "'id','code','number'",
      heurEnableAll: true,
      defPath: './table-definitions.json',
      tsFolder: '/Users/hardy/Development/Onn/ddl-to-gql/example/src/gen/onn/ts',
      gqlFolder: '/Users/hardy/Development/Onn/ddl-to-gql/example/src/gen/onn/gql',
      override: true,
      gqlNoRoot: true,
      sqlFactory: 'knex',
    });
  });
});

// TODO create nested folders for defPath and heurPath if needed
