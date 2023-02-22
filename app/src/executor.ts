import {DdlInterpreter} from './ddl-interpreter/ddl-interpreter';
import {ModelGenerator} from './model-generator/model-generator';
import {RepoGenerator} from './repo-generator/repo-generator';
import {ResolverGenerator} from './resolver-generator/resolver-generator';
import fs from 'fs';
import {TableDef} from './model';
import {Globals} from './globals';

export interface ExecutorOptions {
  phases: ('ddl' | 'model' | 'repo' | 'resolver')[];
  tDefPath: string;
  ddlPath?: string;
  destFolder?: string;
  tsPrefix?: string;
  gqlPrefix?: string;
  overrideDest?: boolean;
}

export class Executor {
  constructor(
    private ddlInterpreter: DdlInterpreter,
    private modelGenerator: ModelGenerator,
    private repoGenerator: RepoGenerator,
    private resolverGenerator: ResolverGenerator
  ) {}

  execute(options: ExecutorOptions) {
    this.assertOptions(options);

    if (options.phases.indexOf('ddl') >= 0) {
      this.executeDdl(options.ddlPath!, options.tDefPath);
    }

    const tableDefsRaw = fs.readFileSync(options.tDefPath, 'utf-8');
    const tableDefs: TableDef[] = JSON.parse(tableDefsRaw);

    if (options.phases.indexOf('model') >= 0) {
      const res = this.modelGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.destFolder}/model.ts`, res);
    }
    if (options.phases.indexOf('repo') >= 0) {
      const res = this.repoGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.destFolder}/repos.ts`, res);
    }
    if (options.phases.indexOf('resolver') >= 0) {
      const res = this.resolverGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.destFolder}/resolvers.ts`, res);
    }
  }

  private assertOptions(options: ExecutorOptions) {
    if ((options.phases.length === 0 || options.phases.indexOf('ddl') >= 0) && !options.ddlPath) {
      throw Error('The option ddlPath is mandatory when ddl interpretation is enabled');
    }

    if (options.phases.length === 0 ||
        options.phases.indexOf('model') >= 0 ||
        options.phases.indexOf('repo') >= 0 ||
        options.phases.indexOf('resolver') >= 0) {
      if (!options.destFolder) {
        throw Error('The option destFolder is mandatory when code generation is enabled');
      }else {
        if(!fs.existsSync(options.destFolder)) {
          fs.mkdirSync(options.destFolder)
        }else if(fs.readdirSync(options.destFolder).length >0) {
          if(options.overrideDest){
            fs.rmdirSync(options.destFolder, {recursive: true})
            fs.mkdirSync(options.destFolder)
          } else {
            throw Error('The destFolder is not empty. Use --override to automatically clear the destFolder.');
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

  private executeDdl(ddlPath: string, tDefPath: string) {
    const ddl = fs.readFileSync(ddlPath, 'utf-8');
    const tableDefs = this.ddlInterpreter.execute(ddl);
    fs.writeFileSync(tDefPath, JSON.stringify(tableDefs, undefined, 2));
  }
}
