import RdflibQueryEngine from '../src/RdflibQueryEngine';

import { mockHttp } from './util';
import { graph, namedNode } from 'rdflib';

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

const PROFILE_URL = 'https://www.w3.org/People/Berners-Lee/card#i';
const OTHER_PROFILE_URL = 'https://ruben.inrupt.net/profile/card';

describe('An RdflibQueryEngine instance without default source', () => {
  const engine = new RdflibQueryEngine();

  mockHttp();

  it('yields no results for a SELECT query', async () => {
    const result = engine.execute(SELECT_TYPES);
    expect(await readAll(result)).toHaveLength(0);
  });

  it('yields no results for a SELECT query with an empty source', async () => {
    const result = engine.execute(SELECT_TYPES, []);
    expect(await readAll(result)).toHaveLength(0);
  });

  it('yields results for a SELECT query with a string URL', async () => {
    // Check all items
    const result = engine.execute(SELECT_TYPES, PROFILE_URL);
    const items = await readAll(result);
    expect(items).toHaveLength(9);

    // Check individual result binding
    const person = items[6];
    expect(person).toBeInstanceOf(Map);
    expect(person).toHaveProperty('size', 2);
    expect(person.has('?subject')).toBe(true);
    expect(person.has('?type')).toBe(true);
    expect(person.get('?subject').equals(
      namedNode(PROFILE_URL))).toBe(true);
    expect(person.get('?type').equals(
      namedNode('http://xmlns.com/foaf/0.1/Person'))).toBe(true);
  });

  it('yields results for a SELECT query with a URL', async () => {
    const result = engine.execute(SELECT_TYPES, new URL(PROFILE_URL));
    const items = await readAll(result);
    expect(items).toHaveLength(9);
  });

  it('yields results for a SELECT query with a NamedNode', async () => {
    const result = engine.execute(SELECT_TYPES, namedNode(PROFILE_URL));
    const items = await readAll(result);
    expect(items).toHaveLength(9);
  });

  it('yields results for a SELECT query with an array', async () => {
    const sources = [[[PROFILE_URL]], Promise.resolve(OTHER_PROFILE_URL)];
    const result = engine.execute(SELECT_TYPES, Promise.resolve(sources));
    const items = await readAll(result);
    expect(items).toHaveLength(16);
  });

  it('throws an error with an unsupported source', async () => {
    const source = { toString: () => 'my source' };
    const result = engine.execute(SELECT_TYPES, source);
    await expect(readAll(result)).rejects
      .toThrow('Unsupported source: my source');
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

describe('An RdflibQueryEngine instance with a default source', () => {
  const engine = new RdflibQueryEngine(PROFILE_URL);

  mockHttp();

  it('yields results for a SELECT query with a string URL', async () => {
    const result = engine.execute(SELECT_TYPES, PROFILE_URL);
    expect(await readAll(result)).toHaveLength(9);
  });
});

async function readAll(asyncIterator) {
  const items = [];
  for await (const item of asyncIterator)
    items.push(item);
  return items;
}
