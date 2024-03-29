import {DdlInterpreter} from './ddl-interpreter';
import fs from 'fs';

describe('DdlInterpreter', () => {
    it('interprets DDL', async () => {
        const ddl = fs.readFileSync('./src/ddl-interpreter/__stubs__/interpret-test.ddl', 'utf-8');
        const tableDefs = new DdlInterpreter().execute(ddl, {});

        fs.mkdirSync('./test/spec', {recursive: true});
        fs.writeFileSync(`./test/spec/interpreted-ddl.json`, JSON.stringify(tableDefs, undefined, 2));
    });

});
