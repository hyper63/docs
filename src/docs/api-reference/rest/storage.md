# hyper `Storage` Service

A hyper `Storage` service is an object storage bucket that can be used to interact with unstructured data like images, videos, and files. Upload, download and remove files.

[[toc]]

## Features

- Upload Images/Videos/Files
- Use resource path to organize objects into sub-folders
- Generate Presigned URLs for uploading or retrieving large objects from the underlying store.

## Why `Storage`?

Most applications will need a way to store assets such as images, videos, or other files. Services like AWS S3, GCP Storage, and MinIO have an absolutely massive API surface, when most folks just need a simple and secure way to upload a couple assets.

A hyper `Storage` Service provides a small and intuitive API for interacting with a Storage bucket.

### Use Cases

#### Profile Images

If your application needs to save images to a User profile, you can use a hyper `Storage` Service to store those images and then retrieve them for display. You can go a step further by placing your `assets` entrypoint behind a CDN, incurring the cost of downloading an asset from your hyper `Storage` Service only when the object is not cached on the CDN.

#### Allow Users to Upload Large Files

If your application requires users to upload large files, for example a large CSV file, you can request a presigned-url from your hyper `Storage` Service. Your user can then upload directly to the underlying store power your hyper `Storage` Service without overloading your application Server or hyper `Server`.

In combination with a hyper `Queue` Service, you can use this pattern to upload large files, then kick off a hyper `Queue` job to fetch that file from hyper `Storage` and process it further ie. ETL.

## Create a `Storage` Service

Create a hyper `Storage` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain).

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { storage } = connect(process.env.HYPER);

await storage.create(); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X PUT https://$HOST/storage/$DOMAIN
```

:::

### Common Responses

| Status |             Description              |                     Response |
| ------ | :----------------------------------: | ---------------------------: |
| 201    |  The `Storage` Service was created   |               `{ ok: true }` |
| 409    | The `Storage` Service already exists | `{ ok: false, status: 409 }` |

## Destroy a `Storage` Service

Destroy a hyper `Storage` Service in the hyper [`Domain`](/docs/concepts/clean-cloud-architecture#hyper-domain). This will remove all objects stored in the `Storage` Service.

:::danger
This is a destructive operation that will destroy the `Storage` Service and all objects stored within it. Be really sure you want to do this, before destroying your `Storage` Service.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { storage } = connect(process.env.HYPER);

await storage.destroy(true); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/storage/$DOMAIN
```

:::

### Common Responses

| Status |             Description              |                     Response |
| ------ | :----------------------------------: | ---------------------------: |
| 200    | The `Storage` Service was destroyed  |               `{ ok: true }` |
| 404    | The `Storage` Service does not exist | `{ ok: false, status: 404 }` |

## Upload an Object

Upload an object to a hyper `Storage` Service.

:::info
When using `hyper-connect`, `storage.upload` accepts a [**Web** `ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
NOT a NodeJS `ReadableStream`.

Starting in `NodeJS` `17`, if you only have a `NodeJS.ReadableStream`, you can use Node's built-in `toWeb`:

```js
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";

// convert to a ReadbleStream from a NodeJS.ReadableStream
await storage.upload("foo.png", Readable.toWeb(createReadStream("foo.png")));
```

:::

::: code-group

```js [node.js]
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { connect } from "hyper-connect";

const { storage } = connect(process.env.HYPER);

const stream = Readable.toWeb(createReadStream("foo.png"));

await storage.upload("/path/in/storage/bucket", stream); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/storage/$DOMAIN/path/in/storage/bucket
  --data-binary "@foo.png"
```

:::

### Common Responses

| Status |              Description               |                     Response |
| ------ | :------------------------------------: | ---------------------------: |
| 200    | The object was successfully downloaded |               `{ ok: true }` |
| 404    |  The `Storage` Service does not exist  | `{ ok: false, status: 404 }` |

## Download an Object

Download an object from a hyper `Storage` Service.

:::info
When using `hyper-connect`, `storage.download`, returns a [**Web** `ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
NOT a NodeJS `ReadableStream`.

Starting in `NodeJS` `17`, if you need a `NodeJS.ReadableStream`, you can use Node's built-in `fromWeb`:

```js
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";

// Convert the ReadableStream to a NodeJS.ReadableStream
await storage.download("foo.png").then((res) => {
  if (!res.ok) throw res;
  return Readable.fromWeb(res.object);
});
```

:::

::: code-group

```js [node.js]
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { connect } from "hyper-connect";

const { storage } = connect(process.env.HYPER);

await storage.download("/path/in/storage/bucket"); // { ok: true, object: ReadableStream }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X GET https://$HOST/storage/$DOMAIN/path/in/storage/bucket
```

:::

### Common Responses

| Status |              Description               |                     Response |
| ------ | :------------------------------------: | ---------------------------: |
| 200    | The object was successfully downloaded |               `{ ok: true }` |
| 404    |  The `Storage` Service does not exist  | `{ ok: false, status: 404 }` |

## Retrieve a Pre-signed URL

the hyper Service Framework does not impose a limit to the size of objects uploaded and downloaded from a hyper `Storage` Service. However, many of the platforms used to deploy The hyper Service Framework do. For example, AWS' API Gateway only allows a payload size of 10MB. AWS Lambda only allows 6MB. GCP's Apigee maximum payload size is 10MB.

Because of these imposed limitations, there needs to be a way to sideskirt the hyper `Server` to upload and download large objects. This is where pre-signed urls come in.

:::info
Using a pre-signed url side-skirts your hyper `Server` and exposes the underlying infra powering hyper `Storage`. Be extra careful not to couple your business logic to this layer.
:::

Receive a Pre-signed URLto underlying store powering hyper `Storage`. You can then use the `url` to interact directly with the underlying store, either uploading or downloading objects.

:::warning
Depending on the `Adapter`, and the underlying store it uses to implement the `Storage` Service, it may or may not provide pre-signed URLs. Ensure the `Storage Adapter` used by your hyper `Server` supports pre-signed URLs.
:::

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { storage } = connect(process.env.HYPER);

// Retrieve a pre-signed url to perform an upload
await storage.signedUrl("/path/in/storage/bucket", { type: "upload" }); // { ok: true, url: '...' }

// Or retrive a pre-signed url to perform a download
await storage.signedUrl("/path/in/storage/bucket", { type: "download" }); // { ok: true, url: '...' }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X POST https://$HOST/storage/$DOMAIN/path/in/storage/bucket?useSignedUrl=true
curl -X GET https://$HOST/storage/$DOMAIN/path/in/storage/bucket?useSignedUrl=true
```

:::

:::info
The `Storage Adapter` implementation will determine the expiration of the URL. Ensure the Adapter's expiration configuration for pre-signed urls fits your use-case
:::

### Common Responses

| Status |                  Description                  |                     Response |
| ------ | :-------------------------------------------: | ---------------------------: |
| 200    | The pre-signed url was successfully generated |          `{ ok: true, url }` |
| 404    |     The `Storage` Service does not exist      | `{ ok: false, status: 404 }` |

## Remove an Object

Remove an Object from a hyper `Storage` Service

::: code-group

```js [node.js]
import { connect } from "hyper-connect";

const { storage } = connect(process.env.HYPER);

// Retrieve a pre-signed url to perform an upload
await storage.remove("/path/in/storage/bucket"); // { ok: true }
```

```sh [curl]
export HOST="hyper.host"
export DOMAIN="foobar"

curl -X DELETE https://$HOST/storage/$DOMAIN/path/in/storage/bucket
```

:::

### Common Responses

| Status |             Description              |                     Response |
| ------ | :----------------------------------: | ---------------------------: |
| 200    | The object was successfully removed  |               `{ ok: true }` |
| 404    | The `Storage` Service does not exist | `{ ok: false, status: 404 }` |
