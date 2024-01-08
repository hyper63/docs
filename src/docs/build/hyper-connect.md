<h1 align="center">⚡️ hyper-connect ⚡️</h1>

<p align="center">
  <a href="https://github.com/hyper63/hyper63/actions/workflows/connect.yml"><img src="https://github.com/hyper63/hyper63/actions/workflows/connect.yml/badge.svg" alt="Test" /></a>
</p>

[`hyper-connect`](https://github.com/hyper63/hyper/tree/main/packages/connect) is an HTTP client for The hyper Service Framework with an intuitive API, built on top of `fetch`. With `hyper-connect`, you can access all of the hyper `Services` on your HTTP-based hyper `Server`.

[[toc]]

## Install

### NodeJS

```sh
npm install hyper-connect
```

`hyper-connect` constructs a
[Request Object](https://developer.mozilla.org/en-US/docs/Web/API/Request) and sends it to the hyper
server using `fetch`. `hyper-connect` wraps your hyper app's REST API, generating short-lived JWTs
using the provided connection string.

## Getting Started

You will need to construct a `Connection String` to your hyper `Server`. It is common to set this as the `HYPER` environment variable in your application:

```js
import { connect } from 'hyper-connect'

/**
 * Your connection string informs hyper-connect where your hyper Server is located,
 * which hyper Domain to interact with, and how to authenticate with your hyper Server
 */
process.env.HYPER = `https://<sub>:<secret>@<host>/<domain>`
const HYPER = process.env['HYPER'] as string

/**
 * hyper-connect will automatically generate a short-lived JWT, whose sub is "user"
 * and is signed using "password" and the HS256 algorithm.
 */
const { data, cache, storage, queue, search } = connect(HYPER)
```

### NodeJS (TypeScript)

```ts
import { connect } from "hyper-connect";

const HYPER = process.env["HYPER"] as string;

const { data, cache, storage, queue, search } = connect(HYPER);

await data.add({ id: "game-1", type: "game", name: "Donkey Kong" });
await data.add({ id: "game-2", type: "game", name: "Pac Man" });
await data.add({ id: "game-3", type: "game", name: "Galaga" });

const results = await data.query({ type: "game" });
```

### NodeJS (ESM)

```js
import { connect } from "hyper-connect";

const HYPER = process.env["HYPER"];

const { data, cache, storage, queue, search } = connect(HYPER);

await data.add({ id: "game-1", type: "game", name: "Donkey Kong" });
await data.add({ id: "game-2", type: "game", name: "Pac Man" });
await data.add({ id: "game-3", type: "game", name: "Galaga" });

const results = await data.query({ type: "game" });
```

### NodeJS (CJS)

```js
const { connect } = require("hyper-connect");

const HYPER = process.env["HYPER"];

const { data, cache, storage, queue, search } = connect(HYPER);

await data.add({ id: "game-1", type: "game", name: "Donkey Kong" });
await data.add({ id: "game-2", type: "game", name: "Pac Man" });
await data.add({ id: "game-3", type: "game", name: "Galaga" });

const results = await data.query({ type: "game" });
```

#### Node 18 and `localhost`

Starting with Node 17, Node has changed how it resolves `localhost`, when using global `fetch` and
`fetch` from libraries like `undici`. This may cause requests to `localhost` not to resolve
correctly and fail. To get around this, you can use `127.0.0.1` or `0.0.0.0`, in lieu of
`localhost`. For more info, See [this issue](https://github.com/nodejs/node/pull/39987)

### Deno

```js
import { connect } from "https://x.nest.land/hyper-connect@VERSION/deno/mod.ts";

const HYPER = Deno.env.get("HYPER");

const { data, cache, storage, queue, search } = connect(HYPER);

await data.add({ id: "game-1", type: "game", name: "Donkey Kong" });
await data.add({ id: "game-2", type: "game", name: "Pac Man" });
await data.add({ id: "game-3", type: "game", name: "Galaga" });

const results = await data.query({ type: "game" });
```

## Examples

### How to add a document to hyper `Data`?

```js
const doc = {
  id: "movie-1",
  type: "movie",
  title: "Dune",
  year: "2021",
};

const result = await data.add(doc);
console.log(result); // {ok: true, id: "movie-1"}
```

### How to get all the documents of type 'movie'?

```js
const result = await data.query({ type: "movie" });
console.log(result); // {ok: true, docs: [...]}
```

### How to add a `Cache` key/value pair to hyper cache?

```js
const result = await cache.add("key", { counter: 1 });
console.log(result); // {ok: true}
```

## Documentation

hyper is a suite of service apis, with hyper connect you can specify the api you want to connect
with and the action you want to perform. [service].[action] - with each service there are a
different set of actions to call. This table breaks down the service and action with description of
the action.

### data

| Service | Action  | Description                                                                           |
| ------- | ------- | ------------------------------------------------------------------------------------- |
| data    | create  | create a hyper `Data` Service                                                         |
| data    | destroy | destroy a hyper `Data` Service                                                        |
| data    | add     | creates a json document in a hyper `Data` Service                                     |
| data    | list    | lists the documents given a start, stop, limit range from a hyper `Data` Service      |
| data    | get     | retrieves a document by id from a hyper `Data` Service                                |
| data    | update  | updates a given document by id from a hyper `Data` Service                            |
| data    | remove  | removes a document from a hyper `Data` Service                                        |
| data    | query   | queries for a set of documents based on selector criteria from a hyper `Data` Service |
| data    | index   | creates an index in a hyper `Data` Service                                            |
| data    | bulk    | inserts, updates, and removes documents from a hyper `Data` Service                   |

### cache

| Service | Action  | Description                                                                            |
| ------- | ------- | -------------------------------------------------------------------------------------- |
| cache   | create  | create a hyper `Cache` Service                                                         |
| cache   | destroy | destroy a hyper `Cache` Service                                                        |
| cache   | add     | creates a json document at the `key` in the hyper `Cache` Service                      |
| cache   | get     | retrieves a document by key from a hyper `Cache` Service                               |
| cache   | set     | sets a given document by key from a hyper `Cache` Service                              |
| cache   | remove  | removes a document by key from a hyper `Cache` Service                                 |
| cache   | query   | queries for a set of documents based on a pattern matcher from a hyper `Cache` Service |

### search

| Service | Action  | Description                                              |
| ------- | ------- | -------------------------------------------------------- |
| search  | create  | create a hyper `Search` Service                          |
| search  | destroy | destroy a hyper `Search` Service                         |
| search  | add     | indexes a json document in a hyper `Search` Service      |
| search  | get     | retrieves a document from a hyper `Search` Service       |
| search  | remove  | removes a document from the a hyper `Search` Service     |
| search  | query   | fuzzy searches a hyper `Search` Service                  |
| search  | load    | loads a batch of documents into a hyper `Search` Service |

### storage

| Service | Action   | Description                                            |
| ------- | -------- | ------------------------------------------------------ |
| storage | create   | create a hyper `Storage` Service                       |
| storage | destroy  | destroy a hyper `Storage` Service                      |
| storage | upload   | adds object/file to a hyper `Storage` Service          |
| storage | download | retrieves a object/file from a hyper `Storage` Service |
| storage | remove   | removes a object/file from a hyper `Storage` Service   |

### queue

| Service | Action  | Description                                               |
| ------- | ------- | --------------------------------------------------------- |
| queue   | create  | WIP create a hyper `Queue`                                |
| queue   | destroy | WIP destroy a hyper `Queue`                               |
| queue   | enqueue | posts object to a hyper `Queue`                           |
| queue   | errors  | gets list of error jobs that occurred on a hyper `Queue`  |
| queue   | queued  | gets list of objects that are queued and ready to be sent |

---

### Verify hyper `Queue` Service Request Signatures

A hyper `Queue` Service targets your specified web hook worker to receive jobs. In order to secure that
endpoint to only receive jobs from a hyper `Queue` service, you can provide a secret when creating the hyper `Queue`. This `Queue` will then sign requests it sends to your webhook worker using a sha256 `nounce` timestamp and a signature in the `X-HYPER-SIGNATURE` header.

`createHyperVerify` on
`hyper-connect` makes it easier to implement your own middleware to validate these incoming jobs,
in a secure way.

```js
import { createHyperVerify } from 'hyper-connect'

const signatureVerify = createHyperVerify(process.env.QUEUE_SECRET, '1m')

export const validateSignature(req, res, next) {
  const result = signatureVerify(req.headers.get('x-hyper-signature'), req.body))
  if (!result.ok) {
    return res.setStatus(result.status).send({msg: result.msg})
  }
  next()
}
```
