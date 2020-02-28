import {
  graph,
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
    yield* results;
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
  async readSources(sources, store = graph()) {
    return store;
  }
}
