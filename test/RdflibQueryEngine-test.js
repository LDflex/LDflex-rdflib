import RdflibQueryEngine from '../src/RdflibQueryEngine';

import { graph } from 'rdflib';

jest.mock('rdflib', () => {
  const rdflib = jest.requireActual('rdflib');
  rdflib.graph = jest.fn(rdflib.graph);
  return rdflib;
});

const SELECT_TYPES = `
  SELECT ?subject ?type WHERE {
    ?subject a ?type.
  }
`;

describe('An RdflibQueryEngine instance without default source', () => {
  const engine = new RdflibQueryEngine();

  it('yields no results for a SELECT query', async () => {
    const result = engine.execute(SELECT_TYPES);
    expect(await readAll(result)).toHaveLength(0);
  });

  it('yields no results for a SELECT query with an empty source', async () => {
    const result = engine.execute(SELECT_TYPES, []);
    expect(await readAll(result)).toHaveLength(0);
  });

  it('throws an error when query execution fails', async () => {
    const store = graph();
    store.query = (query, onResult, fetcher, onEnd) =>
      onEnd(new Error('query failure'));
    graph
      .mockReturnValueOnce(store)
      .mockReturnValueOnce(store);

    const result = engine.execute(SELECT_TYPES, []);
    await expect(readAll(result)).rejects
      .toThrow('query failure');
  });

  it('does not support UPDATE queries', async () => {
    const result = engine.execute('UPDATE xyz');
    await expect(readAll(result)).rejects
      .toThrow('SPARQL UPDATE queries are unsupported, received: UPDATE xyz');
  });

  it('does not support INSERT queries', async () => {
    const result = engine.execute(' insert xyz');
    await expect(readAll(result)).rejects
      .toThrow('SPARQL UPDATE queries are unsupported, received:  insert xyz');
  });
});

async function readAll(asyncIterator) {
  const items = [];
  for await (const item of asyncIterator)
    items.push(item);
  return items;
}
