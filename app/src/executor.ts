import {DdlInterpreter, Overrides} from './ddl-interpreter/ddl-interpreter';
import { ModelGenerator } from './model-generator/model-generator';
import { RepoGenerator } from './repo-generator/repo-generator';
import { ResolverGenerator } from './resolver-generator/resolver-generator';
import fs from 'fs';
import { TableDef } from './model';
import { Globals } from './globals';
import { MainGenerator } from './main-generator/main-generator';
import { SchemaGenerator } from './schema-generator/schema-generator';
import { associateBy } from './util';
import { HeuristicEngine } from './heuristics/heuristic-engine';

export interface ExecutorOptions {
  phases: ('ddl' | 'heuristics' | 'model' | 'repo' | 'resolver' | 'schema' | 'main')[];
  defPath: string;
  ddlOverridesPath?: string;
  heurPath?: string;
  heurSuffixes?: string;
  heurEnableAll?: boolean;
  ddlPath?: string;
  tsFolder?: string;
  tsPrefix?: string;
  gqlPrefix?: string;
  gqlFolder?: string;
  gqlNoRoot?: boolean;
  sqlFactory?: string;
  override?: boolean;
}

export class Executor {
  constructor(
    private ddlInterpreter: DdlInterpreter,
    private heuristicEngine: HeuristicEngine,
    private modelGenerator: ModelGenerator,
    private repoGenerator: RepoGenerator,
    private resolverGenerator: ResolverGenerator,
    private schemaGenerator: SchemaGenerator,
    private mainGenerator: MainGenerator
  ) {}

  execute(options: ExecutorOptions) {
    console.log(`Options`, options);

    this.assertOptions(options);

    if (options.phases.length === 0 || options.phases.indexOf('ddl') >= 0) {
      console.log(`Phase: ddl`);
      const overrides: Overrides =  options.ddlOverridesPath && fs.existsSync(options.ddlOverridesPath)
          ? JSON.parse(fs.readFileSync(options.ddlOverridesPath, 'utf-8'))
          : {};
      this.executeDdl(options.ddlPath!, options.defPath, overrides);
    }

    const sourceTableDefs: TableDef[] = JSON.parse(fs.readFileSync(options.defPath, 'utf-8'));

    if (options.phases.length === 0 || options.phases.indexOf('heuristics') >= 0) {
      console.log(`Phase: heuristics`);
      this.executeHeuristics(sourceTableDefs, options.heurPath!, options.heurSuffixes?.split(',') ?? [], options.heurEnableAll);

    }
    const heuristics: TableDef[] = options.heurPath && fs.existsSync(options.heurPath)
      ? JSON.parse(fs.readFileSync(options.heurPath, 'utf-8'))
      : [];
    const tableDefs = Executor.mergeTableDefs(sourceTableDefs, heuristics);

    if (options.phases.length === 0 || options.phases.indexOf('model') >= 0) {
      console.log(`Phase: model`);
      const res = this.modelGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.tsFolder}/model.ts`, res);
    }
    if (options.phases.length === 0 || options.phases.indexOf('repo') >= 0) {
      console.log(`Phase: repo`);
      const res = this.repoGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.tsFolder}/repos.ts`, res);
    }
    if (options.phases.length === 0 || options.phases.indexOf('resolver') >= 0) {
      console.log(`Phase: resolver`);
      const res = this.resolverGenerator.execute(tableDefs, options.gqlNoRoot);
      fs.writeFileSync(`${options.tsFolder}/resolvers.ts`, res);
    }
    if (options.phases.length === 0 || options.phases.indexOf('schema') >= 0) {
      console.log(`Phase: schema`);
      const res = this.schemaGenerator.execute(tableDefs, options.gqlNoRoot);
      fs.writeFileSync(`${options.gqlFolder}/onn-ddl-to-gql.graphql`, res);
    }
    if (options.phases.length === 0 || options.phases.indexOf('main') >= 0) {
      console.log(`Phase: main`);
      const res = this.mainGenerator.execute(options.sqlFactory);
      fs.writeFileSync(`${options.tsFolder}/index.ts`, res);
    }
    console.log(`Success`);
  }

  private assertOptions(options: ExecutorOptions) {
    if ((options.phases.length === 0 || options.phases.indexOf('ddl') >= 0) && !options.ddlPath) {
      throw Error('The option ddlPath is mandatory when ddl interpretation is enabled');
    }

    if (
      options.phases.length === 0 ||
      options.phases.indexOf('model') >= 0 ||
      options.phases.indexOf('repo') >= 0 ||
      options.phases.indexOf('resolver') >= 0 ||
      options.phases.indexOf('main') >= 0
    ) {
      if (!options.tsFolder) {
        throw Error('The option destFolder is mandatory when typescript generation is enabled');
      } else {
        if (!fs.existsSync(options.tsFolder)) {
          fs.mkdirSync(options.tsFolder, { recursive: true });
        } else if (fs.readdirSync(options.tsFolder).length > 0) {
          if (options.override) {
            fs.rmSync(options.tsFolder, { recursive: true });
            fs.mkdirSync(options.tsFolder, { recursive: true });
          } else {
            throw Error(
              'The destFolder is not empty. Use --override to automatically clear the destFolder.'
            );
          }
        }
      }
    }

    if (options.phases.length === 0 || options.phases.indexOf('schema') >= 0) {
      if (!options.gqlFolder) {
        throw Error('The option gqlFolder is mandatory when GQL generation is enabled');
      } else {
        if (!fs.existsSync(options.gqlFolder)) {
          fs.mkdirSync(options.gqlFolder);
        } else if (fs.readdirSync(options.gqlFolder).length > 0) {
          if (options.override) {
            fs.rmSync(options.gqlFolder, { recursive: true });
            fs.mkdirSync(options.gqlFolder);
          } else {
            throw Error(
              'The gqlFolder is not empty. Use --override to automatically clear the gqlFolder.'
            );
          }
        }
      }
    }

    if (options.tsPrefix) {
      Globals.TS_PREFIX = options.tsPrefix;
    }

    if (options.gqlPrefix) {
      Globals.GQL_PREFIX = options.gqlPrefix;
    }
  }

  private executeDdl(ddlPath: string, tDefPath: string, overrides: Overrides) {
    const ddl = fs.readFileSync(ddlPath, 'utf-8');
    const tableDefs = this.ddlInterpreter.execute(ddl, overrides);
    fs.writeFileSync(tDefPath, JSON.stringify(tableDefs, undefined, 2));
  }

  private executeHeuristics(sourceTableDefs: TableDef[], heurPath: string, suffixes: string[], heurEnableAll?: boolean) {
    const heurs = this.heuristicEngine.execute(sourceTableDefs, {suffixes, heurEnableAll});
    fs.writeFileSync(heurPath, JSON.stringify(heurs, undefined, 2));
  }

  static mergeTableDefs(
    sourceTableDefs: TableDef[],
    ...partialTableDefs: TableDef[][]
  ): TableDef[] {
    const tableDefsRecord = associateBy(sourceTableDefs, (td) => td.tableName);
    partialTableDefs.forEach((tableDefs) =>
      tableDefs.forEach((def) => {
        tableDefsRecord[def.tableName].columns = [
          ...tableDefsRecord[def.tableName].columns,
          ...def.columns,
        ];
        tableDefsRecord[def.tableName].relations = [
          ...tableDefsRecord[def.tableName].relations,
          ...def.relations.filter(r => r.enabled),
        ];
      })
    );
    const res = Object.values(tableDefsRecord);
    res.sort((l, r) => l.tableName.localeCompare(r.tableName));
    return res;
  }
}
