import RdflibQueryEngine from '../src/RdflibQueryEngine';

describe('An RdflibQueryEngine instance', () => {
  const engine = new RdflibQueryEngine();

  it('does not support UPDATE queries', async () => {
    const results = engine.execute('UPDATE xyz');
    await expect((async () => {
      for await (const result of results)
        throw new Error('unexpected result');
    })()).rejects.toThrow('SPARQL UPDATE queries are unsupported, received: UPDATE xyz');
  });

  it('does not support INSERT queries', async () => {
    const results = engine.execute(' insert xyz');
    await expect((async () => {
      for await (const result of results)
        throw new Error('unexpected result');
    })()).rejects.toThrow('SPARQL UPDATE queries are unsupported, received:  insert xyz');
  });
});
