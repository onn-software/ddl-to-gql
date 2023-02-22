import fs from 'fs';
import {MainGenerator} from './main-generator';
import {TableDef} from '../model';

describe('MainGenerator', () => {
  it('generates repo', async () => {
    const repo = new MainGenerator().execute();

    fs.writeFileSync(`./temp/main.ts`, repo);
  });
});
