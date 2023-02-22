import { Command } from 'commander';
import { Executor } from './executor';
import { DdlInterpreter } from './ddl-interpreter/ddl-interpreter';
import { ModelGenerator } from './model-generator/model-generator';
import { RepoGenerator } from './repo-generator/repo-generator';
import { ResolverGenerator } from './resolver-generator/resolver-generator';
import { SchemaGenerator } from './schema-generator/schema-generator';
import { MainGenerator } from './main-generator/main-generator';

const program = new Command();

program
  .name('@onn/ddl-to-gql')
  .description('Convert a SQL DDL to a GraphQL implementation with all relations.')
  .version('0.0.1')
  .option('--defPath <text>', 'Path to interpreted ddl file.', './table-definitions.json')
  .option(
    '--phases <phases>',
    'Comma separated phases, or omit for all phases. Phases: [ddl,model,repo,resolver,schema,main].'
  )
  .option('--ddlPath <text>', 'Path to ddl file. Required for phases [ddl].')
  .option(
    '--tsFolder <text>',
    'Output folder fot ts files. Required for phases [model,repo,resolver,main].'
  )
  .option('--tsPrefix <text>', 'Optional prefix for TS types.')
  .option('--gqlFolder <text>', 'Output folder fot ts files. Required for phases [schema].')
  .option('--gqlPrefix <text>', 'Optional prefix for GQL types.')
  .option('--sqlFactory <text>', 'Omit for custom factory, or chose one from: [knex].')
  .option('--override', 'Will delete the destination folder before saving new output.');

program.parse(process.argv);
const programOptions = program.opts();
programOptions['phases'] = programOptions['phases']?.split(',') ?? [];

new Executor(
  new DdlInterpreter(),
  new ModelGenerator(),
  new RepoGenerator(),
  new ResolverGenerator(),
  new SchemaGenerator(),
  new MainGenerator()
).execute(program.opts());
