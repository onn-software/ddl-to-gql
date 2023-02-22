import { Executor } from './executor';
import { DdlInterpreter } from './ddl-interpreter/ddl-interpreter';
import { ResolverGenerator } from './resolver-generator/resolver-generator';
import { RepoGenerator } from './repo-generator/repo-generator';
import { ModelGenerator } from './model-generator/model-generator';

describe('Executor', () => {
  it('executes all phases when array is empty', async () => {
    new Executor(
      new DdlInterpreter(),
      new ModelGenerator(),
      new RepoGenerator(),
      new ResolverGenerator()
    ).execute({
      phases: [],
      ddlPath: './src/ddl-interpreter/__stubs__/interpret-te',
      tDefPath: './',
      destFolder: 'test',
    });
  });
});
