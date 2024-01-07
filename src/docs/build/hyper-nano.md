# hyper {nano} - hyper in a Bottle

Because hyper is built to be modular using the [Ports and Adapters](/docs/concepts/clean-cloud-architecture) Architecture, **`Adapters` and `Apps` are _interchangeable_**. This is how we can test our business layer without choosing a database, for example. We can simply stub the `Adapter` that implements the `Port` that the core business logic interacts with.

This also means The hyper Service Framework can be ran using a set of `Adapters` designed to run ephemerally, perhaps for development environments. This is where hyper `{nano}` shines.

hyper `{nano}` is a compiled hyper `Server` using a set of "local development" adapters. It uses the HTTP-based RESTful app based on `express`[built by the Core team](/docs/api-reference/rest/index), and the same hyper `Core`, but with a set of adapters that allow it to run locally sandboxed, and is fast and simple to quickly spin up and then blow away.

- data (powered by [In-Memory MongoDB](https://github.com/hyper63/hyper-adapter-mongodb))
- cache (powered by [Sqlite](https://github.com/hyper63/hyper-adapter-sqlite))
- storage (powered by your local [file system](https://github.com/hyper63/hyper-adapter-fs))
- search (powered by [Sqlite and Minisearch](https://github.com/hyper63/hyper-adapter-minisearch))
- queue (powered by [Sqlite and an in-memory queue](https://github.com/hyper63/hyper-adapter-queue))

hyper `{nano}` is great for development or sandboxed short-lived environments ie. GitHub Workspaces or GitPod. Developers will use hyper `{nano}` to power their services tier in their local development environment.

Then in deployed environments, an hosted hyper `Server` is used that is running `Adapters` backed by more robust external services. **The interactions with the hyper Server do not change!**

To use `hyper nano`, you can download a compiled binary and run it

```sh
curl https://hyperland.s3.amazonaws.com/hyper -o nano
chmod +x nano
./nano
```

There are binaries built for each major platform:

- [Linux](https://hyperland.s3.amazonaws.com/hyper)
- [Darwin (Mac)](https://hyperland.s3.amazonaws.com/hyper-x86_64-apple-darwin)
- [Darwin ARM (Mac M1)](https://hyperland.s3.amazonaws.com/hyper-aarch64-apple-darwin)
- [Windows](https://hyperland.s3.amazonaws.com/hyper-x86_64-pc-windows-msvc.exe)

## Node Usage

Alternatively, if you use `Node`, you may run `hyper-nano` using `npx`:

```sh
npx hyper-nano --domain=foobar --experimental --data --cache ...
```

## Deno Usage

Alternatively, if you use `Deno` you may run `hyper-nano` directly from the source:

```sh
deno run --allow-run --allow-env --allow-read --allow-write=__hyper__ --allow-net --unstable --no-check=remote https://raw.githubusercontent.com/hyper63/hyper/main/images/nano/mod.js
```

If you'd like to programmatically start `hyper-nano`, you can import `main.js` and run `main`:

```js
import { main } from "https://raw.githubusercontent.com/hyper63/hyper/main/images/nano/main.js";

await main();
```

and then run:

```sh
deno run --allow-env --allow-read --allow-write=__hyper__ --allow-net --unstable --no-check=remote foo.js
```

All of these examples above will start a `hyper nano` instance, listening on port `6363`. You can
then consume your hyper instance
[`hyper-connect`](https://github.com/hyper63/hyper/tree/main/packages/connect) (recommended) or
using `HTTP`.

To consume using [`hyper-connect`](https://github.com/hyper63/hyper/tree/main/packages/connect) pass
`http://127.0.0.1:[port]/[domain]` to `hyper-connect` as your
[`connection string`](https://docs.hyper.io/app-keys#nq-connection-string)

Consume with [`hyper-connect`](https://github.com/hyper63/hyper/tree/main/packages/connect):

```js
import { connect } from "hyper-connect";

const hyper = connect("http://127.0.0.1:6363/test");

await hyper.data.list();
```

Or consume via HTTP

```sh
curl http://127.0.0.1:6363/data/test
```

## Bootstrapping services

> **This feature is experimental and will need the `--experimental` flag to be enabled**

`hyper nano` can be supplied arguments to create services on startup:

- `--data`: create a hyper data service on startup
- `--cache`: create a hyper cache service on startup
- `--storage`: createa a hyper storage service on startup

Other command line arguments can be provided:

- `--purge`: destroy the existing services. You may also pass in which service types to purge. ie
  `./nano --experimental --data --cache --storage --purge=data,cache` will delete `data` and
  `cache`, but not `storage`
- `--domain`: the name of the domain your services will be created under. This defaults to `test`

Examples:

```sh
# Listen on 6363
./nano

# Purge the existing data service, then create a new one in test domain
./nano --experimental --data --purge

# Purge the cache service, then create data and cache services in test domain
./nano --experimental --data --cache --purge=cache

# Purge data, cache, and storage, then create data, cache, and storage services in test domain
./nano --experimental --data --cache --storage --purge
```

or programmatically:

```js
import { main } from "https://raw.githubusercontent.com/hyper63/hyper/main/images/nano/main.js";

/**
 * - Listen on 6363
 * - Purge data service in test domain
 * - Create data, cache, and storage services in the test domain
 */
await main({
  domain: "test",
  experimental: true,
  services: {
    data: true,
    cache: true,
    storage: true,
  },
  purge: {
    data: true,
  },
});
```

Learn more about hyper `{nano}` [here](https://github.com/hyper63/hyper/tree/main/images/nano)
