#!/usr/bin/env node
import { Command } from 'commander';
import { Executor } from './executor';
import { DdlInterpreter } from './ddl-interpreter/ddl-interpreter';
import { ModelGenerator } from './model-generator/model-generator';
import { RepoGenerator } from './repo-generator/repo-generator';
import { ResolverGenerator } from './resolver-generator/resolver-generator';
import { SchemaGenerator } from './schema-generator/schema-generator';
import { MainGenerator } from './main-generator/main-generator';
import { HeuristicEngine } from './heuristics/heuristic-engine';

const program = new Command();

program
  .name('@onn-software/ddl-to-gql')
  .description('Convert a SQL DDL to a GraphQL implementation with all relations. See https://www.npmjs.com/package/@onn-software/ddl-to-gql for more details.')
  .version('0.0.1')
  .option('--ddlPath <text>', 'Required for phases [ddl]: Path to ddl file.')
  .option(
    '--defPath <text>',
    'Optional: Path to interpreted ddl file.',
    './onn/table-definitions.json'
  )
  .option(
    '--heurPath <text>',
    'Optional: Path to heuristics file, used in phases [heuristics,model,repo,resolver,schema].',
    './onn/heuristics.json'
  )
  .option(
    '--heurSuffixes <text>',
    'Optional: Comma seperated list of possible suffixes, used in phases [heuristics].',
    'id'
  )
  .option(
    '--heurEnableAll',
    'Optional: Flag to indicate to enable all found heuristics, without inspection by the user, used in phases [heuristics].',
    false
  )
  .option(
    '--tsFolder <text>',
    'Optional: Output folder fot TS files, used in phases [model,repo,resolver,main].',
    './onn/ts'
  )
  .option('--tsPrefix <text>', 'Optional: Prefix for TS types.', 'Onn')
  .option(
    '--gqlFolder <text>',
    'Optional: Output folder fot GQL files, used in phases [schema].',
    './onn/gql'
  )
  .option('--gqlPrefix <text>', 'Optional: Prefix for GQL types.', 'Gql')
  .option('--gqlNoRoot', 'Optional: Make types instead of root query/mutation.', false)
  .option('--sqlFactory <text>', 'Optional: Omit for custom factory, or chose one from: [knex], used in phases [main].')
  .option(
    '--override',
    'Optional: Will delete the destination files and folders before saving new output.',
    false
  )
  .option(
    '--phases <phases>',
    'Optional: Comma separated phases, or omit for all phases. Phases: [ddl,heuristics,model,repo,resolver,schema,main].'
  )
    .addHelpText('afterAll', '')
    .addHelpText('afterAll', 'Basic usage example: npx @onn-software/ddl-to-gql --ddlPath ./example.ddl')
    .addHelpText('afterAll', '');

program.parse(process.argv);
const programOptions = program.opts();
programOptions['phases'] = programOptions['phases']?.split(',') ?? [];

new Executor(
  new DdlInterpreter(),
  new HeuristicEngine(),
  new ModelGenerator(),
  new RepoGenerator(),
  new ResolverGenerator(),
  new SchemaGenerator(),
  new MainGenerator()
).execute(program.opts());
