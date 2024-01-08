# hyper `Queue` Service

A hyper `Queue` Service enables creating and executing secured asynchronous workloads by dispatching a `payload` to a worker endpoint.

[[toc]]

## Features

- Enqueue Jobs to be dispatched to a worker endpoint
- Job signing by the hyper `Queue` Service enables secure processing of payloads.
- View jobs that are queued or jobs that resulted in an error

## Why `Queue`?

Most applications have additional work to perform, beyond solely responding to client requests. Additionally, in order for the transactional system to quickly respond to client requests, it is often desirable to queue additional work, to be performed asynchronously, on another process, or perhaps another service entirely, thus ensuring client requests are not blocked or slowed by background work.

A hyper `Queue` Service works great for implementations that need to offload short-lived processes, in order to prevent blocking or slowing transactions for a client application.

A hyper `Queue` also works great for serverless execution environments that are "suspended" once a response is sent back to the client, thus preventing additional processing from being performed.

There are tons of queue technologies, fitting a variety of use-cases, ranging from simple to complex. If you're familiar with AWS, A hyper `Queue` Service fits a similar use-case as a Lambda triggered via an SQS Queue event source.

### Use Cases

- Execute job to send a notification or email upon signing up
- Notify another system about an event, ie. Sentry, Segment, Hubspot, etc.
- Execute a re-occurring job, like calculating aggregates to store in a cache (like a hyper `Cache`)
- Process and re-upload profile images to produce multiple form--factors ie. thumbnails (like hyper `Storage`)

A hyper `Queue` Service is paired great with other hyper Services like [`Data`](./data), [`Cache`](./cache.md), or [`Storage`](./storage.md).

## Create a `Queue` Service

Create a hyper `Queue` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain).

When creating a hyper `Queue` Service, you may provide an optional `secret`. If provided, the hyper `Queue` Service will include a signature on each job sent to your worker, in the `X-HYPER-SIGNATURE` header. This allows the worker to verify that the job was sent by its corresponding hyper queue, not by a third party, and is unaltered.

::: info
A hyper queue will generate an `X-HYPER-SIGNATURE`, **if and only if** you provide a `secret` when creating the queue.
:::

::: warning
Some frameworks, for example `NextJS` , will lowercase headers names ie. `x-hyper-signature`, so be sure to take this into account, when checking for the signature.
:::

### Input

| Field    | Type [optional] |                                                                                 Description |
| -------- | :-------------: | ------------------------------------------------------------------------------------------: |
| `target` |     string      |                                                             The URL of your worker endpoint |
| `secret` |    [string]     | The secret used to sign requests sent to your worker endpoint, by the hyper `Queue` Service |

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { queue } = connect(process.env.HYPER);

await queue.create({
  target: "https://my.api/hooks/jobs",
  secret: "shhhhh",
}); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X PUT https://$HOST/queue/$DOMAIN
  -H 'Content-Type: application/json' \
  -d '{ "target": "https://my.api/hooks/jobs", "secret": "shhhh" }'
```

:::

### Common Responses

| Status |            Description             |                     Response |
| ------ | :--------------------------------: | ---------------------------: |
| 201    |  The `Queue` Service was created   |               `{ ok: true }` |
| 409    | The `Queue` Service already exists | `{ ok: false, status: 409 }` |

## Destroy a `Queue` Service

Destroy a hyper `Queue` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain). This will remove all queued and errored jobs stored in the `Queue` Service.

:::danger
This is a destructive operation that will destroy the `Queue` Service and all queued and errored jobs stored within it. Be really sure you want to do this, before destroying your `Queue` Service.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { queue } = connect(process.env.HYPER);

await queue.destroy(true); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/queue/$DOMAIN
```

### Common Responses

| Status |            Description             |                     Response |
| ------ | :--------------------------------: | ---------------------------: |
| 200    | The `Queue` Service was destroyed  |               `{ ok: true }` |
| 404    | The `Queue` Service does not exist | `{ ok: false, status: 404 }` |

## Enqueue a Job

Enqueue a job, to be dispatched to your hyper `Queue` Service worker endpoint. The job will then be automatically dispatched to your worker endpoint using a `POST`. The body will be the job contents as JSON.

::: info
Depending on the `Adapter`, and the underlying mechanism it uses to implement the `Queue` Service, there may be a delay between when the job is enqueued and when it is dispatched to your worker endpoint. For most implementations, this dispatch occurs as fast as the queue can be drained.

Ensure the `Adapter` you choose to power hyper `Queue` services on your hyper `Server` fits your use-case.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { queue } = connect(process.env.HYPER);

await queue.enqueue({ type: "MOVIE_ADDED", id: "movie-1" }); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/queue/$DOMAIN
 -H 'Content-Type: application/json' \
 -d '{ "type": "MOVIE_ADDED", id: "movie-1" }'
```

### Input

The job MUST be a JSON object, and it may contain any fields.

::: info
We recommend keeping job payloads small, containing only the context needed for your worker endpoint to successfully process the job.

Also, we recommend adding a `type` to your job payload, so your worker may distinguish and process multiple job types.
:::

### Common Responses

| Status |                  Description                  |                     Response |
| ------ | :-------------------------------------------: | ---------------------------: |
| 201    |           The document was created            |               `{ ok: true }` |
| 409    | A document stored at the `key` already exists | `{ ok: false, status: 409 }` |

### Output from your Worker Endpoint

Your worker endpoint should respond with a successful status code ie. `200`. If your worker responds with a non-successful status code ie. `4xx` or `5xx`, the hyper `Queue` Service will conclude the job resulted in an error and use the received body as the recorded error for the job. (See [Retrieve Jobs](#retrieve-jobs))

## Verifying Requests from a hyper `Queue` Service

When a hyper `Queue` receives a job, it will `POST` the job payload to your provided worker endpoint.

When creating a hyper `Queue` Service, you may provide an optional `secret`. If provided, the hyper `Queue` Service will include a signature on each job sent to your worker, in the `X-HYPER-SIGNATURE` header. This allows the worker to verify that the job was sent by its corresponding hyper queue, not by a third party, and is unaltered.

### Why would you want to verify a job?

Since your worker endpoint is a public URL, anyone may attempt to `POST` jobs to it. This is a potential vector for malicious actors to spoof your worker, causing it to process jobs that did not originate from your hyper `Queue` Service, or have been altered in some way:

- A bad actor posts a hand-crafted job to the worker
- A bad actor intercepts a legitimate job, sent by your hyper queue, and alters the payload, before forwarding it to your worker. This is known as a ["man in the middle attack"](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)
- A bad actor intercepts a legitimate job, sent by your hyper queue, and then sends it again, deliberately delays its transmission, or modifies the timestamp. This is known as a ["replay attack"](https://en.wikipedia.org/wiki/Replay_attack)

By including a signature in the `X-HYPER-SIGNATURE` header, for each request sent to your worker endpoint, your worker can verify that the job was sent by your hyper `Queue` Service, and not by a third party, and that the payload is unaltered.

::: info
In addition to verifying jobs, we recommend verifying the job payloads fit the shape expected by your worker business logic.

Use a schema validation library like [`Zod`](https://github.com/colinhacks/zod) to verify inputs before invoking your business logic.
:::

### How to verify the signature

The `X-HYPER-SIGNATURE` header contains a `timestamp` and a `signature`. The `timestamp` is prefixed by `t=`, and the signature is prefixed by `sig=`.

```
X-HYPER-SIGNATURE:
t=1643654130111,
sig=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

If you're using [`hyper-connect`](/docs/build/hyper-connect), `hyper-connect` comes with a utility, `createHyperVerify`, you can use to help verify the `X-HYPER-SIGNATURE`. See [Verify hyper `Queue` Service Request Signatures](/docs/build/hyper-connect#verify-hyper-queue-service-request-signatures). If you do not use `hyper-connect`, you can still verify the signature by following the steps below.

A hyper `Queue` Service generates signatures using a hash-based message authentication code [(HMAC)](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code) with [SHA-256](https://en.wikipedia.org/wiki/SHA-2). To verify the signature included on the job, follow the steps below.

#### Step 1: Extract the timestamp and signatures from the header 

Split the header, using the `,` character as the separator, to get a list of elements. Then split each element, using the `=` character as the separator, to get a prefix and value pair.

The value for the prefix `t` corresponds to the timestamp, and `sig` corresponds to the signature. You can discard all other elements.

#### Step 2: Prepare the signed payload string 

The "signed payload" string is created by concatenating:

1. The timestamp (as a string)
2. The character: `.`
3. The stringified JSON payload (that is, the request body) ie. `JSON.stringify(body, null, 0)`

#### Step 3: Determine the expected signature

Compute an HMAC with the SHA256 hash function. Use your hyper `Queue` Service `secret` as the key, and use the signed payload string as the message.

#### Step 4: Compare the signatures 

Compare the signature, in the `sig` value of the `X-HYPER-SIGNATURE` header, to your generated expected signature. If the signatures match, you can be sure that:

1. The job's payload has not been altered
2. The job's timestamp has not been altered

For additional security, you may also compare the time signature value `t` of the `X-HYPER-SIGNATURE` header, to the current UTC time, and decide whether the difference is within your worker's tolerance. For example, your worker may have a business constraint where it ought only process jobs if the job was sent within the last `5 minutes`. Remember, by verifying the `sig` value, you also verify that the time signature was not altered, and is, therefore, safe to rely on for comparison.

#### Example Verifying a Signature

Here's an example of how your worker might verify an incoming job using [express](https://expressjs.com/):

```js
import forge from "node-forge";
import express from "express";

const fiveMins = 5 * 60 * 1000;
const secret = process.env["WORKER_SECRET"];

// express middleware
function verifySignature(req, res, next) {
  const [timepart, sigpart] = req.headers["x-hyper-signature"].split(",");

  const [, time] = timepart.split("t=");
  const [, sig] = sigpart.split("sig=");

  const hmac = forge.hmac.create();
  hmac.start("sha256", secret);
  hmac.update(`${time}.${JSON.stringify(req.body, null, 0)}`);
  const computed = hmac.digest().toHex();

  // payload or time signature was tampered with
  if (computed !== sig) return res.setStatus(401).send("Unauthorized");

  const now = new Date().getTime();
  const dateSent = new Date(time).getTime();
  const diff = now - dateSent;

  // timestamp in the future, or not within 5 minutes
  if (diff < 0 || diff > fiveMins)
    return res.setStatus(422).send("Timestamp not within acceptable range");

  // continue
  next();
}

function handleQueueJob(req, res) {
  const { body } = req;
  // processing
  res.json({ ok: true });
}

const app = express();

app.post("/", express.json(), verifySignature, handleQueueJob);

app.listen(3000);
```

### Retrieve Jobs

Returns jobs that are still enqueued or were reported by your worker endpoint to have resulted in an error. You can check and potentially retry jobs that resulted in an error.

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { queue } = connect(process.env.HYPER);

// Jobs enqueued waiting to be dispatched
await queue.queued(); // { ok: true, jobs: [{ type: "MOVIE_ADDED, id: "movie-1" } ] }

// Jobs that resulted in an error
await queue.errors();
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X GET https://$HOST/queue/$DOMAIN?status=READY
curl -X GET https://$HOST/queue/$DOMAIN?status=ERROR
```

:::

### Common Responses

| Status |                  Description                  |                                                       Response |
| ------ | :-------------------------------------------: | -------------------------------------------------------------: |
| 200    | The matching jobs were retrieved successfully | `{ ok: true, jobs: [{ type: "MOVIE_ADDED, id: "movie-1" } ] }` |
| 404    |      The `Queue` Service does not exist       |                                   `{ ok: false, status: 404 }` |
