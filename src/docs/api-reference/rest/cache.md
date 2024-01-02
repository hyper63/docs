# hyper `Cache` Service

A hyper `Cache` service is a simple key-value store, where the key is a unique string and the value is a JSON document.

This service keeps caching simple giving you a pattern matcher query to return a filtered set of values, or you can retrieve directly by key.

[[toc]]

## Features

- `ttl`: Time-To-Live to specify how long to cache a document, such as 3 minutes, 3 hours, or 3 days.

- `query`: Using simple pattern matching, request a batch of keys and values. This feature gives you the ability to pull a batch of keys and values in one request.

## Why `Cache`?

The primary purpose of a cache is to provide fast and inexpensive access to copies of data. Most applications will have hotspots in its persisted data, data that is accessed more frequently than others, and seldomly updated.

By caching those hotspots, the application can be made more performant and load can be removed from the primary database.

Additionally, some database queries are especially expensive to perform. An example is queries that involve multiple round trips (or worse `JOIN`s), or queries with intensive calculations.

By caching such query results, you pay the price of the query, or intensive calculations only once. Then you can quickly retrieve the data multiple times without having to re-execute the query or re-perform the intensive calculation.

### Use Cases

#### Fast Document Retrievals

When your application is performing a high volume of reads on the database, one way to keep your database from being overloaded with requests is to cache heavily requested documents. You can then use the cache to read the documents. With this pattern, the cache will be continually updated with the most recent documents, you would then write to the cache once a document was successfully created on the datastore, and then client requests would check the cache before checking the datastore for documents.

:::info
Your cache key does not have to be the same as your document key. Use the cache key to create fast pattern queries on your documents.

Instead of running the same query for the same list of documents against your database, you could pull this data from the cache, instead. This takes the stress off of your database.

For example, if you name your key the combination of the document `type` and the document `_id`, then you could query your cache for all of the documents of a given type, keeping the stress off of your database.
:::

#### Aggregate Metrics

Caches are great for counts and other aggregates such as mean, median, min, max, standard deviation, etc. By storing aggregates in the cache, you reduce the need to perform complex queries against the database. You can proactively update the count or sum in the cache after the data is stored in the database. When a request comes in, retrieve the value from the cache. If the value does not reside in the cache, then run the expensive query to get the value and post it to the cache for next time.

:::info
Depending on your use cases, you might find it valuable to seed the cache during off-hours by running queries and caching their results.

A good seeding strategy requires that you know when cache hits occur to ensure the cached data is as fresh as possible.
:::

## Create a `Cache` Service

Create a hyper `Cache` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain).

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { cache } = connect(process.env.HYPER);

await cache.create(); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X PUT https://$HOST/cache/$DOMAIN
```

:::

### Common Responses

| Status |            Description             |                     Response |
| ------ | :--------------------------------: | ---------------------------: |
| 201    |  The `Cache` Service was created   |               `{ ok: true }` |
| 409    | The `Cache` Service already exists | `{ ok: false, status: 409 }` |

## Destroy a `Cache` Service

Destroy a hyper `Cache` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain). This will remove all key-value pairs stored in the `Cache` Service.

:::danger
This is a destructive operation that will destroy the `Cache` Service and all key-value pairs stored within it. Be really sure you want to do this, before destroying your `Cache` Service.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { cache } = connect(process.env.HYPER);

await cache.destroy(true); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/cache/$DOMAIN
```

:::

### Common Responses

| Status |            Description             |                     Response |
| ------ | :--------------------------------: | ---------------------------: |
| 201    |  The `Cache` Service was created   |               `{ ok: true }` |
| 404    | The `Cache` Service does not exist | `{ ok: false, status: 404 }` |

## Cache a Document

Store a Document in the `Cache` Service at the specified `key`

A hyper `Data` Service document is a JSON document with one to many fields. An `_id` field is allowed. If an `_id` is not provided, it will be generated by the hyper `Server`. The `_id` field MUST be unique.

::: code-group

```js [node.js]
import { connect } from 'hyper-connect'

const { cache } = connect(process.env.HYPER)

await cache.add('movie-1', { _id: "...", ... }, '2h') // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/cache/$DOMAIN
 -H 'Content-Type: application/json' \
 -d '{ "key": "movie-1", "value": { "_id": "...", "title": "Ghostbusters", "year": "1984", "type": "movie" }, "ttl": "2h" }'
```

### Input

| Field   | Type [optional] |                                                                                   Description |
| ------- | :-------------: | --------------------------------------------------------------------------------------------: |
| `key`   |     string      |                                                            The `key` to store the document at |
| `value` |     object      |                                                                     The document to be stored |
| `ttl`   |    [string]     | The Time-To-Live for the cached value. If not provided, then the value is cached indefinitely |

#### `ttl` Format

The `ttl` provided should follow the format `XY` where `X` is a number, and `Y` is a single character representing a unit of time:

`s`: `seconds`
`m`: `minutes`
`h`: `hours`
`d`: `days`
`w`: `weeks`
`y`: `years`

Eg. `10s`, `15m`, `5h`, `2d`, `1w`, `1y`

:::

### Common Responses

| Status |                  Description                  |                     Response |
| ------ | :-------------------------------------------: | ---------------------------: |
| 201    |           The document was created            |               `{ ok: true }` |
| 409    | A document stored at the `key` already exists | `{ ok: false, status: 409 }` |

## Retrieve a Document

Retrieve a Document in the `Cache` Service at the specified `key`

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { cache } = connect(process.env.HYPER);

await cache.get("movie-1"); // { ok: true, doc: {...} }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X GET https://$HOST/cache/$DOMAIN/movie-1
```

:::

### Common Responses

| Status |                                     Description                                     |                     Response |
| ------ | :---------------------------------------------------------------------------------: | ---------------------------: |
| 201    |                              The document was created                               |   `{ ok: true, doc: {...} }` |
| 404    | A document stored at the `key` does not exist or the `Cache` Service does not exist | `{ ok: false, status: 404 }` |

## Replace a Document

Replace a Document in the `Cache` Service at the specified `key`. This operation REPLACES the document, so the entire document must be provided.

::: code-group

```js [node.js]
import { connect } from 'hyper-connect'

const { cache } = connect(process.env.HYPER)

await cache.set('movie-1', { _id: "...", ... }, '2h') // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X PUT https://$HOST/cache/$DOMAIN/movie-1?ttl=2h
 -H 'Content-Type: application/json' \
 -d '{ "_id": "...", "title": "Ghostbusters", "year": "1984", "type": "movie" }'
```

See [`ttl` Format](#ttl-format) on how to format the `ttl` if provided.

:::

### Common Responses

| Status |            Description             |                     Response |
| ------ | :--------------------------------: | ---------------------------: |
| 200    |      The document was created      |               `{ ok: true }` |
| 404    | The `Cache` Service does not exist | `{ ok: false, status: 404 }` |

## Remove a Document

Remove a Document in the `Cache` Service at the specified `key`.

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { cache } = connect(process.env.HYPER);

await cache.remove("movie-1"); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/cache/$DOMAIN/movie-1
```

:::

### Common Responses

| Status |                                     Description                                     |                     Response |
| ------ | :---------------------------------------------------------------------------------: | ---------------------------: |
| 200    |                              The document was removed                               |               `{ ok: true }` |
| 404    | A document stored at the `key` does not exist or the `Cache` Service does not exist | `{ ok: false, status: 404 }` |

## Query a `Cache` Service

Query the `Cache` Service for all key-value pairs, whose `key` matches the provided `pattern`. Using the `*` wildcard, you can define patterns that match all the key-values that either start with the provided pattern, end with the pattern, or is in-between the pattern.

For example `movie-*`, `*-1984`, or `movie*1984`

:::info
Remember, you `Cache` Service `key`s do not need to be strictly `_id` from a hyper `Data` Service. They can be anything! You can store more information in your `key`s, such that a pattern can fetch multiple cached documents in a single request.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { cache } = connect(process.env.HYPER);

await cache.query("movie*"); // { ok: true, docs: [ { key: 'movie-5', value: {...} } ] }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST|GET https://$HOST/cache/$DOMAIN/_query?pattern=movie*
```

:::

### Common Responses

| Status |            Description             |                                                  Response |
| ------ | :--------------------------------: | --------------------------------------------------------: |
| 200    |      The query was successful      | `{ ok: true, docs: [ { key: 'movie-5', value: {...} } ]}` |
| 404    | The `Cache` Service does not exist |                              `{ ok: false, status: 404 }` |
