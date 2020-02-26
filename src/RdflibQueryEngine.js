/**
 * Asynchronous iterator wrapper for the rdflib.js SPARQL query engine.
 */
export default class RdflibQueryEngine {
  /**
   * Creates an asynchronous iterable of results for the given SPARQL query.
   */
  async* execute(sparql, source) {
    if ((/^\s*(?:INSERT|UPDATE)/i).test(sparql))
      yield* this.executeUpdate(sparql, source);
  }

  /**
   * Creates an asynchronous iterable with the results of the SPARQL UPDATE query.
   */
  async* executeUpdate(sparql, source) {
    throw new Error(`SPARQL UPDATE queries are unsupported, received: ${sparql}`);
  }
}
