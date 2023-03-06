import fs from 'fs';
import {TableDef} from '../model';
import {HeuristicEngine} from './heuristic-engine';

describe('HeuristicEngine', () => {
  it('generates repo', async () => {
    const tableDefs: TableDef[] =  require('../../test/spec/interpreted-ddl.json');
    const heuristics = new HeuristicEngine().execute(tableDefs, {suffixes:['id','code','number']});

    fs.writeFileSync(`./test/spec/heuristic.json`, JSON.stringify(heuristics, undefined, 2));
  });
});
