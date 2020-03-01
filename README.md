# rdfib.js query support for LDflex
This library lets you use
the built-in SPARQL query engine of
the [rdflib.js](https://github.com/linkeddata/rdflib.js/)
with the [LDflex](https://github.com/LDflex/LDflex) language.

[![npm version](https://img.shields.io/npm/v/@ldflex/rdflib.svg)](https://www.npmjs.com/package/@ldflex/rdflib)
[![Build Status](https://travis-ci.org/LDflex/LDflex-rdflib.svg?branch=master)](https://travis-ci.org/LDflex/LDflex-rdflib)
[![Dependency Status](https://david-dm.org/LDflex/LDflex-rdflib.svg)](https://david-dm.org/LDflex/LDflex-rdflib)

## Installation
```bash
npm install ldflex @ldflex/rdflib
```

## Usage
```JavaScript
import { PathFactory } from 'ldflex';
import RdflibQueryEngine from '@ldflex/rdflib';
import { namedNode } from 'rdflib';

// The JSON-LD context for resolving properties
const context = {
  "@context": {
    "@vocab": "http://xmlns.com/foaf/0.1/",
    "friends": "knows",
  }
};
// The query engine and its source
const queryEngine = new RdflibQueryEngine('https://ruben.verborgh.org/profile/');
// The object that can create new paths
const paths = new PathFactory({ context, queryEngine });

async function showPerson(person) {
  console.log(`This person is ${await person.name}`);

  console.log(`${await person.givenName} is friends with:`);
  for await (const name of person.friends.givenName)
    console.log(`- ${name}`);
}

const ruben = paths.create({
  subject: namedNode('https://ruben.verborgh.org/profile/#me'),
});
showPerson(ruben);
```

## License
©2020–present
[Ruben Verborgh](https://ruben.verborgh.org/).
[MIT License](https://github.com/LDflex/LDflex-rdflib/blob/master/LICENSE.md).
