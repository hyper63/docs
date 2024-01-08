# hyper `Search` Service

A hyper `Search` Service is a search index that allows for full-text fuzzy search.

Index documents by adding them to your hyper `Search` Service. Then query using text criteria to perform a full-text search.

[[toc]]

## Features

- Fuzzy search your documents using simple text and optional filter.
- Bulk index documents to reduce round trips and quick initialize your index

## Why `Search`?

Many applications eventually need some sort of fuzzy searching capabilities. Transactional databases are typically ill-equipped to handle these sorts of use-cases, without deep coupling of your business logic to the underlying DBMS, and/or without placing intense load on the DBMS. This could negatively affect the performance of the transactional system, and the reliablity of the database.

On the other hand, many teams reach for using the database in the first place, precisely because search infrastructure is typically complex to provision and maintain, and not cheap to run; the database is typically already spun up. Implementing this kind of feature can "throw a wrench" into the software's otherwise appropriate design.

::: info
In our experience, fuzzy search requirements often-times become a necessity for the business later on in the Product lifecycle, and with lofty goals for the delivery timeline.

Perhaps unfortunately, at least for the team tasked to implement this kind of feature, fuzzy-search complexity is obscured by the proliferation of Search engines able to crawl the worlds knowledge, seemingly in an instant -- "Google" is a verb in the [Merriam-Webster Dictionary](https://www.merriam-webster.com/dictionary/google).
:::

Too many times, technical debt, coupling, and complexity arise, not from a software teams inability to design software well, but because of short deadlines, tight budgets, lack of speciailization, or security compliance.

The hyper `Search` Service's goal, like other hyper Service Framework services, is to asuage some of this complexity. It has a small, general-purpose, and intuitive API surface that abstracts the complexity of creating indexes, indexing documents, and fuzzy-searching across them. This allows the infrastructure used to power fuzzy-search to scale and change, as needed by the business and not all upfront, without coupling business logic.

## Use Cases

- Full-text search across multiple fields and document types
- Typeahead search bar with fuzzy match capabilities

A hyper `Search` Service is paired great with other hyper Services, like [`Data`](./data), and [`Cache`](./cache.md).

## Create a `Search` Service

Create a hyper `Search` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain).

A hyper `Search` Service is like a data store, but whose API and workload is geared towards fuzzy searching. When create a hyper `Search` Service, you will need to specify which document fields will be used to search and which document fields should be stored as part of the document.

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { search } = connect(process.env.HYPER);

await search.create({
  fields: ["title", "year"],
  storeFields: ["id", "title", "type", "year"],
}); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X PUT https://$HOST/search/$DOMAIN
  -H 'Content-Type: application/json' \
  -d '{"fields": ["title", "year"], "storeFields": ["id", "title", "type", "year"]}'
```

:::

### Input

| Field         | Type [optional] |                                                                    Description |
| ------------- | :-------------: | -----------------------------------------------------------------------------: |
| `fields`      |    string[]     |       the fields on documents you would like to index (to be fuzzy-searchable) |
| `storeFields` |   [string[]]    | The fields to be stored in the index and returned when the document is matched |

### Common Responses

| Status |             Description             |                     Response |
| ------ | :---------------------------------: | ---------------------------: |
| 201    |  The `Search` Service was created   |               `{ ok: true }` |
| 409    | The `Search` Service already exists | `{ ok: false, status: 409 }` |

## Destroy a `Search` Service

Destroy a hyper `Search` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain). This will remove all documents stored in the `Search` Service.

:::danger
This is a destructive operation that will destroy the `Search` Service and all documents stored within it. Be really sure you want to do this, before destroying your `Search` Service.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { search } = connect(process.env.HYPER);

await search.destroy(true); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/search/$DOMAIN
```

:::

### Common Responses

| Status |             Description             |                     Response |
| ------ | :---------------------------------: | ---------------------------: |
| 200    | The `Search` Service was destroyed  |               `{ ok: true }` |
| 404    | The `Search` Service does not exist | `{ ok: false, status: 404 }` |

## Index a Document

Store a Document in the `Search` Service at the specified `key`

::: info
Use a schema validation library like [`Zod`](https://github.com/colinhacks/zod) to verify documents are the shape your business logic expects, prior to indexing in your hyper `Search` Service.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { search } = connect(process.env.HYPER);

const doc = {
  _id: "book-3",
  type: "book",
  name: "Dune",
  author: "Frank Herbert",
  published: "1965",
};

await search.add(doc._id, doc); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/search/$DOMAIN
 -H 'Content-Type: application/json' \
 -d '{"key": "book-3", "doc": { "id": "book-3", "type": "book", "name": "Dune", "author": "Frank Herbert", "published": "1965" }}'
```

### Input

| Field | Type [optional] |                                                                 Description |
| ----- | :-------------: | --------------------------------------------------------------------------: |
| `key` |     string      | The unique `key` to store the document at within the hyper `Search` Service |
| `doc` |     object      |                                                   The document to be stored |

:::

### Common Responses

| Status |                  Description                  |                     Response |
| ------ | :-------------------------------------------: | ---------------------------: |
| 201    |           The document was indexed            |               `{ ok: true }` |
| 404    |      The `Search` Service does not exist      | `{ ok: false, status: 404 }` |
| 409    | A document stored at the `key` already exists | `{ ok: false, status: 409 }` |

## Retrieve a Document

Retrieve a Document in the `Search` Service at the specified `key`

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { search } = connect(process.env.HYPER);

await search.get("movie-1"); // { ok: true, doc: {...} }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X GET https://$HOST/search/$DOMAIN/movie-1
```

:::

### Common Responses

| Status |                                     Description                                      |                     Response |
| ------ | :----------------------------------------------------------------------------------: | ---------------------------: |
| 201    |                              The document was retrieved                              |   `{ ok: true, doc: {...} }` |
| 404    | A document stored at the `key` does not exist or the `Search` Service does not exist | `{ ok: false, status: 404 }` |

## Remove a Document

Remove a Document in the `Search` Service at the specified `key`.

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { search } = connect(process.env.HYPER);

await search.remove("movie-1"); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/search/$DOMAIN/movie-1
```

:::

### Common Responses

| Status |                                     Description                                      |                     Response |
| ------ | :----------------------------------------------------------------------------------: | ---------------------------: |
| 200    |                               The document was removed                               |               `{ ok: true }` |
| 404    | A document stored at the `key` does not exist or the `Search` Service does not exist | `{ ok: false, status: 404 }` |

## Index Multiple Documents

Add multiple documents to the hyper `Search` Service. This can be used to indes multiple documents, all within a single operation!

:::info
Each document must have an `_id` field. It will be used at the unique `key` in the index.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { search } = connect(process.env.HYPER);

await search.load([
  { _id: "1001", type: "movie", title: "Ghostbusters" },
  { _id: "1002", type: "movie", title: "Ghostbusters 2" },
  { _id: "1003", type: "movie", title: "Groundhog Day" },
]); // { ok: true, results: [{ id: '1001', ok: true }, ...]}
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/search/$DOMAIN/_bulk
  -H 'Content-Type: application/json' \
  -d '[{ "_id_": "book-1", "type": "book", "name": "Dune", "author": "Frank Herbert", "published": "1965" }, { "_id_": "book-2", "type": "book", "name": "The Hobbit", "author": "J.R.R Tolkien", "published": "1937" }]'
```

:::

### Common Responses

| Status |                          Description                          |                                                Response |
| ------ | :-----------------------------------------------------------: | ------------------------------------------------------: |
| 200    | The documents were added to the `Search` Service successfully | `{ ok: true, results: [{ id: '1001', ok: true }, ...]}` |
| 404    |              the `Search` Service does not exist              |                            `{ ok: false, status: 404 }` |

## Query a `Search` Service

Query the `Search` Service for all documents that match the search criteria.

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { search } = connect(process.env.HYPER);

await search.query("Frank Herbert", {
  fields: ["title"], // only return these fields (optional)
  filter: { year: "1984" }, // only documents whose year field is '1984'
}); // { ok: true, matches: [ { ... } ] }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/search/$DOMAIN/_query
  -H 'Content-type: application/json' \
  -d '{"query": "Frank Herbert", "fields": ["author"] }'
```

:::

### Input

| Field    | Type [optional] |                                                                                                                                                                                                                        Description |
| -------- | :-------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| `query`  |     string      |                                                                                                                                                                                              the text you would like to search for |
| `fields` |   [string[]]    |                                          a list of fields you would like to target the search against. Each string in the array should match a property in the [fields specified when creating the hyper `Search` Service](#input) |
| `filter` |    [object]     | this object contains key/value pairs that should reduce the results based on the result of the filter. Each string in the array should match a property in the [fields specified when creating the hyper `Search` Service](#input) |

::: info
It's not uncommon to only specify `query` text when querying the hyper `Search` Service.
:::

### Common Responses

| Status |             Description             |                             Response |
| ------ | :---------------------------------: | -----------------------------------: |
| 200    |      The query was successful       | `{ ok: true, matches: [ { ... } ] }` |
| 404    | The `Search` Service does not exist |         `{ ok: false, status: 404 }` |
