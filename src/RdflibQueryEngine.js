import {
  graph,
  Fetcher,
  SPARQLToQuery as sparqlToQuery,
} from 'rdflib';

/**
 * Asynchronous iterator wrapper for the rdflib.js SPARQL query engine.
 */
export default class RdflibQueryEngine {
  /**
   * Creates a query engine with the given sources as default.
   */
  constructor(defaultSources) {
    this._defaultStore = this.readSources(defaultSources);
  }

  /**
   * Creates an asynchronous iterable of results for the given SPARQL query.
   */
  async* execute(sparql, sources) {
    if ((/^\s*(?:INSERT|UPDATE)/i).test(sparql))
      yield* this.executeUpdate(sparql, sources);

    // Parse the SPARQL query
    const query = sparqlToQuery(sparql, true, graph());
    // Load the sources if passed, the default sources otherwise
    const store = await (sources ? this.readSources(sources) : this._defaultStore);

    // Execute the query and store the results in an array
    const results = [];
    await new Promise((resolve, reject) => {
      store.query(query, result => results.push(result), null,
        error => error ? reject(error) : resolve(results));
    });
    // Convert every result to a map
    for (const result of results)
      yield new Map(Object.entries(result));
  }

  /**
   * Creates an asynchronous iterable with the results of the SPARQL UPDATE query.
   */
  async* executeUpdate(sparql, sources) {
    throw new Error(`SPARQL UPDATE queries are unsupported, received: ${sparql}`);
  }

  /**
   * Reads the specified stores into a store.
   */
  async readSources(sourceList, store = graph()) {
    let source = await sourceList;
    if (source) {
      // Transform URLs or terms into strings
      if (source instanceof URL)
        source = source.href;
      else if (source.termType === 'NamedNode')
        source = source.value;

      // Read a document from a URL
      if (typeof source === 'string') {
        const document = source.replace(/#.*/, '');
        const fetcher = new Fetcher(store);
        await fetcher.load(document);
      }
      // Read an array of sources
      else if (Array.isArray(source)) {
        await Promise.all(source.map(s => this.readSources(s, store)));
      }
      // Error on unsupported sources
      else {
        throw new Error(`Unsupported source: ${source}`);
      }
    }
    return store;
  }
}
