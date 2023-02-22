import {DdlInterpreter} from './ddl-interpreter/ddl-interpreter';
import {ModelGenerator} from './model-generator/model-generator';
import {RepoGenerator} from './repo-generator/repo-generator';
import {ResolverGenerator} from './resolver-generator/resolver-generator';
import fs from 'fs';
import {TableDef} from './model';
import {Globals} from './globals';
import {MainGenerator} from './main-generator/main-generator';
import {SchemaGenerator} from './schema-generator/schema-generator';

export interface ExecutorOptions {
  phases: ('ddl' | 'model' | 'repo' | 'resolver' | 'schema' | 'main')[];
  defPath: string;
  ddlPath?: string;
  tsFolder?: string;
  tsPrefix?: string;
  gqlPrefix?: string;
  gqlFolder?: string;
  sqlFactory?: string;
  override?: boolean;
}

export class Executor {
  constructor(
    private ddlInterpreter: DdlInterpreter,
    private modelGenerator: ModelGenerator,
    private repoGenerator: RepoGenerator,
    private resolverGenerator: ResolverGenerator,
    private schemaGenerator: SchemaGenerator,
    private mainGenerator: MainGenerator
  ) {}

  execute(options: ExecutorOptions) {
    console.log(`Options`, options);

    this.assertOptions(options);
    if (options.phases.length===0 || options.phases.indexOf('ddl') >= 0) {
      console.log(`Phase: ddl`);
      this.executeDdl(options.ddlPath!, options.defPath);
    }

    const tableDefsRaw = fs.readFileSync(options.defPath, 'utf-8');
    const tableDefs: TableDef[] = JSON.parse(tableDefsRaw);

    if (options.phases.length===0 || options.phases.indexOf('model') >= 0) {
      console.log(`Phase: model`);
      const res = this.modelGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.tsFolder}/model.ts`, res);
    }
    if (options.phases.length===0 || options.phases.indexOf('repo') >= 0) {
      console.log(`Phase: repo`);
      const res = this.repoGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.tsFolder}/repos.ts`, res);
    }
    if (options.phases.length===0 || options.phases.indexOf('resolver') >= 0) {
      console.log(`Phase: resolver`);
      const res = this.resolverGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.tsFolder}/resolvers.ts`, res);
    }
    if (options.phases.length===0 || options.phases.indexOf('schema') >= 0) {
      console.log(`Phase: schema`);
      const res = this.schemaGenerator.execute(tableDefs);
      fs.writeFileSync(`${options.gqlFolder}/onn-ddl-to-gql.graphql`, res);
    }
    if (options.phases.length===0 || options.phases.indexOf('main') >= 0) {
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

    if (options.phases.length === 0 ||
        options.phases.indexOf('model') >= 0 ||
        options.phases.indexOf('repo') >= 0 ||
        options.phases.indexOf('resolver') >= 0 ||
        options.phases.indexOf('main') >= 0) {
      if (!options.tsFolder) {
        throw Error('The option destFolder is mandatory when typescript generation is enabled');
      }else {
        if(!fs.existsSync(options.tsFolder)) {
          fs.mkdirSync(options.tsFolder, {recursive: true})
        }else if(fs.readdirSync(options.tsFolder).length >0) {
          if(options.override){
            fs.rmSync(options.tsFolder, {recursive: true})
            fs.mkdirSync(options.tsFolder, {recursive: true})
          } else {
            throw Error('The destFolder is not empty. Use --override to automatically clear the destFolder.');
          }
        }
      }
    }

    if (options.phases.length === 0 ||
        options.phases.indexOf('schema') >= 0) {
      if (!options.gqlFolder) {
        throw Error('The option gqlFolder is mandatory when GQL generation is enabled');
      }else {
        if(!fs.existsSync(options.gqlFolder)) {
          fs.mkdirSync(options.gqlFolder)
        }else if(fs.readdirSync(options.gqlFolder).length >0) {
          if(options.override){
            fs.rmSync(options.gqlFolder, {recursive: true})
            fs.mkdirSync(options.gqlFolder)
          } else {
            throw Error('The gqlFolder is not empty. Use --override to automatically clear the gqlFolder.');
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
