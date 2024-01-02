# hyper `Data` Service

A hyper `Data` service is a schemaless document data store for storing JSON documents. List, query, add, update, and delete documents. You can also create indexes to improve query performance.

A hyper `Data` service ought to be conceptualized as a single "pool" of documents. It is schemaless by design, leaving schema enforcement up to the consuming applications business logic.

:::info
Be sure to include any appropriate authN/Z on the request. See [Securing your hyper `Server`](/docs/build/securing-hyper)
:::

[[toc]]

## Features

- Create, Remove, Update, and Delete documents
- Query Documents using MongoDB-style selectors
- List Documents, to fetch documents by `_id` or to perform range queries against a matcher
- Index Documents, to improve query performance

## Why `Data`?

Most applications need a way to store persistent data, and then retrieve those pieces of data for a given use-case. In other words, a database. A hyper `Data` Service, can serve as a database for your application.

### Why Schemaless?

> The long of this section can be found [in this blog post](https://blog.hyper.io/document-database-design/)

There is a ton of business rules encoded into the relations between business entities, and when data is relational, many teams reach for a relational database to enforce the definition and adherence to a strict normalized table schema. The database _forces_ a taxonomy onto data, early on. At first, this might seem like a good thing. But if software development proves one thing, it's that humans are really bad at predicting the future.

Having relational data does not mean you ought to use your _database_ to enforce those relations. Too often, the persistence model becomes conflated with the business model. In order to assert the business rules are correct, you need a running database, and not just _any_ database, but a specific DBMS. The result is massive coupling to a particular database solution, the inability to assert business rules are correct without a database, and huge switching cost.

:::info
Data normalization was mainly designed at a time when storage and memory were very expensive. There is **nothing** architecturally significant about arranging data into rows and columns.

Remember, the rise of relational databases was, in no small part, an outgrowth of [Clever Marketing](https://blog.cleancoder.com/uncle-bob/2012/05/15/NODB.html).
:::

#### Decouple Business Rules from the Services Tier

A core principle of The hyper Service Framework is to encourage the encapsulation of business rules _away_ from the layers that are not in the applications control, or that could change ie. Cloud services, or more generally speaking, the services tier.

We've found that a Schemaless Document-oriented persistence model is the best way to encourage this. It forces those relations and data types to be checked in _business logic_, and where you can _test_ all of your business rules and without having to run a database to do it.

The result is high confidence in the relational model, decoupling from any particular DBMS, and most importantly the ability to _change_ that model over time, without massive Database migrations.

#### But I need joins for Business Reporting/Analytics

Your transactional Database, powering your transactional application, shouldn't be used for reporting/analytics anyway! Not only are those separate use-cases, which often require a separate data model, but it can impact the performance of your application -- it only takes one badly performing `JOIN` to bring a Relational Database to its knees. Thus the DBA and all the red tape around databases were born.

If need the ability to perform Business Reporting and Analytics, using complex and deep `JOIN`s, this is what a tool like AWS RedShift, or GCP BigQuery are for (hyper `Port` coming soon 😎). A combination of ETL jobs can efficiently sync documents from your transactional database to your analytics/reporting database.

## Create a `Data` Service

Create a hyper `Data` Service in the [`Domain`](/docs/concepts/terminology#domain).

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.create(); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X PUT https://$HOST/data/$DOMAIN
```

:::

### Common Responses

| Status |            Description            |                     Response |
| ------ | :-------------------------------: | ---------------------------: |
| 201    |  The `Data` Service was created   |               `{ ok: true }` |
| 409    | The `Data` Service already exists | `{ ok: false, status: 409 }` |

## Destroy a `Data` Service

Destroy a hyper `Data` Service in the [`Domain`](/docs/concepts/terminology#domain). This will remove all documents stored in the `Data` Service.

:::danger
This is a destructive operation that will destroy the `Data` Service and all documents stored within it. Be really sure you want to do this, before destroying your `Data` Service.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.destroy(true); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/data/$DOMAIN
```

:::

### Common Responses

| Status |            Description            |                     Response |
| ------ | :-------------------------------: | ---------------------------: |
| 201    |  The `Data` Service was created   |               `{ ok: true }` |
| 404    | The `Data` Service does not exist | `{ ok: false, status: 404 }` |

## Create a Document

Store a Document in the `Data` Service.

A hyper `Data` Service document is a JSON document with one to many fields. An `_id` field is allowed. If an `_id` is not provided, it will be generated by the hyper `Server`. The `_id` field MUST be unique.

:::tip
We recommend providing your own `_id`, when creating a document, that is appropriate for your use-case.
:::

:::tip
Because a hyper `Data` Service is schemaless, it's common practice to add a `type` field onto each document, to distinguish it from other documents in your `Data` Service. This is similar to patterns used in [Single Table Design](https://blog.hyper.io/document-database-design/)
:::

::: code-group

```js [node.js]
import { connect } from 'hyper-connect'

const { data } = connect(process.env.HYPER)

await data.add({ _id: "...", ... }) // { ok: true, id: "..." }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/data/$DOMAIN
 -H 'Content-Type: application/json' \
 -d '{ "_id": "...", "title": "Ghostbusters", "year": "1984", "type": "movie" }'
```

:::

### Common Responses

| Status |                Description                |                     Response |
| ------ | :---------------------------------------: | ---------------------------: |
| 201    |         The document was created          |    `{ ok: true, id: '...' }` |
| 409    | A document with that `_id` already exists | `{ ok: false, status: 409 }` |

## Retrieve a Document

Retrieve a document from a `Data` Service by `_id`

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.get("..."); // { ok: true, doc: { ... } }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X GET https://$HOST/data/$DOMAIN/$ID
  -H 'X-HYPER-LEGACY-GET=false'
```

:::

### Common Responses

| Status |                                  Description                                   |                     Response |
| ------ | :----------------------------------------------------------------------------: | ---------------------------: |
| 200    |                           The document was retrieved                           | `{ ok: true, doc: { ... } }` |
| 404    | A document with that `_id` does not exist or the `Data` Service does not exist | `{ ok: false, status: 404 }` |

## Replace a Document

Replace a document stored in a `Data` Service by `_id`. This operation REPLACES the document, so the entire document must be provided.

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.update("...", {}); // { ok: true, id: "..." }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X PUT https://$HOST/data/$DOMAIN/$ID
  -H 'Content-Type: application/json' \
  -d '{ "_id": "...", "title": "Ghostbusters", "year": "1984", "type": "movie" }'
```

:::

### Common Responses

| Status |                                  Description                                   |                     Response |
| ------ | :----------------------------------------------------------------------------: | ---------------------------: |
| 200    |                           The document was replaced                            |    `{ ok: true, id: '...' }` |
| 404    | A document with that `_id` does not exist or the `Data` Service does not exist | `{ ok: false, status: 404 }` |

## Remove a Document

Remove a document from a `Data` Service by `_id`

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.remove("..."); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/data/$DOMAIN/$ID
```

:::

### Common Responses

| Status |                                  Description                                   |                     Response |
| ------ | :----------------------------------------------------------------------------: | ---------------------------: |
| 200    |                            The document was removed                            |               `{ ok: true }` |
| 404    | A document with that `_id` does not exist or the `Data` Service does not exist | `{ ok: false, status: 404 }` |

## Bulk Document Operation

Perform a bulk operation on the `Data` Service. This can be used to create, update and remove multiple documents, all within a single operation!

:::tip
Each document must have an `_id` field
:::

To remove a document, set a `_deleted` field on the document. Document creation and replacement will be handled automatically, using the documents provided `_id`

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.bulk([
  { _id: "1001", type: "movie", title: "Ghostbusters" },
  { _id: "1002", type: "movie", title: "Ghostbusters 2" },
  { _id: "1003", type: "movie", title: "Groundhog Day" },
  { _id: "1004", type: "movie", title: "Scrooged" },
  { _id: "1005", _deleted: true },
  { _id: "1006", type: "movie", title: "Meatballs" },
  { _id: "1007", type: "movie", title: "Stripes" },
  { _id: "1008", type: "movie", title: "What about Bob?" },
  { _id: "1009", type: "movie", title: "Life Aquatic" },
]); // { ok: true, results: [{ id: '1001', ok: true }, ...]}
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/data/$DOMAIN/_bulk
  -H 'Content-Type: application/json' \
  -d '[{"_id": "movie-4", "title": "St Elmos Fire", "type": "movie", "year": "1985" }]'
```

:::

### Common Responses

| Status |            Description            |                                                Response |
| ------ | :-------------------------------: | ------------------------------------------------------: |
| 200    | The bulk operation was successful | `{ ok: true, results: [{ id: '1001', ok: true }, ...]}` |
| 404    | the `Data` Service does not exist |                            `{ ok: false, status: 404 }` |

## Create a `Data` Service Index

Indexes are used to provide fast search when querying a data service. With this command, you can create a specific index that can be applied to your query command, for more efficient response times.

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.index("title-year-idx", ["title", "year"]); // { ok: true }
// or specify a index sort order
await data.index("title-year-idx", [{ title: "DESC" }, { year: "ASC" }]);
// or specify a partial selector filter, to only index documents which match the selector
await data.index("title-year-idx", ["title", "year"], { type: "movie" });
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/data/$DOMAIN/_index
  -H 'Content-Type: application/json' \
  -d '{ "fields": ["title", "year"]}'
```

:::

:::info
Depending on the `Data` Service Adapter, index sort order, and `partialFilter` may go unused. This is contingent on the underlying tech used by the hyper Adapter implementation.
:::

### Common Responses

| Status |             Description              |                     Response |
| ------ | :----------------------------------: | ---------------------------: |
| 200    | The `Data` Service Index was created |               `{ ok: true }` |
| 404    |  the `Data` Service does not exist   | `{ ok: false, status: 404 }` |

## Query a `Data` Service

Query a hyper `Data` Service and receive an array of documents that match the criteria.

The selector should follow the [MongoDB Query Selector and Projection Operator semantics](https://www.mongodb.com/docs/manual/reference/operator/query/#query-selectors)

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.query(
  {
    year: {
      $gt: 1984,
    },
    type: "movie",
  },
  { limit: 5, skip: 10 }
); // { ok: true, docs: [...] }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/data/$DOMAIN/_query
  -H 'Content-Type: application/json' \
  -d '{ "selector": { "type": "movie", "year": { "$gt": 1984 }}}'
```

:::

### Input

| Field       | Type [optional] |                                                                                       Description |
| ----------- | :-------------: | ------------------------------------------------------------------------------------------------: |
| `selector`  |    [object]     |                                                                          A MongoDB-esque selector |
| `fields`    |   [string[]]    |                  A subset of field on the documents you'd liek to be returned aka. a "projection" |
| `limit`     |    [number]     |                                                   The max number of documents you'd like returned |
| `skip`      |    [number]     |                                            The number of documents to skip over in the result set |
| `sort`      |   [object[]]    | The order you would like your results returned: eg "sort": `[{"year": "DESC"}, {"title": "ASC"}]` |
| `use_index` |    [string]     |                                                                     The index you'd like to query |

### Common Responses

| Status |            Description            |                     Response |
| ------ | :-------------------------------: | ---------------------------: |
| 200    |     They query was successful     |  `{ ok: true, docs: [...] }` |
| 404    | the `Data` Service does not exist | `{ ok: false, status: 404 }` |

:::info
If no documents matched your criteria, then `docs` will be an empty array.
:::

## List Documents in a `Data` Service

Retrieve a list of documents from a hyper `Data` Service.

:::tip
A `list` operation is really handy for fetching multiple documents by `_id`, but it can also be used to perform DynamoDB/Cassandra-esque `range queries` against document `_id`s. If you're clever in what sort of information you store in the document `_id`, this can give you a lot of mileage! You could even go so far as to denormalize your data into multiple documents, based on the access patterns, and then use `range queries` to fetch a hierarchy of documents without joins -- the Cassandra/DynamoDB way.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { data } = connect(process.env.HYPER);

await data.list({
  startkey: "...",
  endkey: "...",
}); // { ok: true, docs: [...] }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X GET https://$HOST/data/$DOMAIN?startkey=...&endkey=...
```

:::

### Input

| Field        |      Type [optional]       |                                                                                                                        Description |
| ------------ | :------------------------: | ---------------------------------------------------------------------------------------------------------------------------------: |
| `startkey`   |          [string]          |                                                                                                         A matcher for document ids |
| `endkey`     |          [string]          |                                                                                                         A matcher for document ids |
| `limit`      |          [number]          |                                                                                    The max number of documents you'd like returned |
| `keys`       |         [string[]]         |                                                   a comma delimited list of key ids for returning documents. Ex: `movie-1,movie-2` |
| `descending` | [boolean] default: `false` | the order of the documents returned, sorted by `_id`. (if `descending` is set, then `startkey` and `endkey` must also be reversed) |

### Common Responses

| Status |            Description            |                     Response |
| ------ | :-------------------------------: | ---------------------------: |
| 200    |     They query was successful     |  `{ ok: true, docs: [...] }` |
| 404    | the `Data` Service does not exist | `{ ok: false, status: 404 }` |
