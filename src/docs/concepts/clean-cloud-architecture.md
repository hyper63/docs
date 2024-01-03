# Clean Cloud Architecture & Terminology

hyper is built using a "[Ports and Adapters](<https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)>)" approach.

The general idea with Ports and Adapters is that the business logic layer defines the models and rules on how they interact with each other, and also a set of consumer-agnostic entry and exit points to and from the business layer. These entry and exit points are called "Ports". All components _external_ to the business layer, interact by way and are interacted _with_, the Ports. A Port defines an api but knows nothing about the mechanism or the impetus. Those two things are an Adapter's job.

Adapters perform the actual communication between external actors and the business layer. There are generally two types of Adapters: "Driving Adapters" and "Driven Adapters".

A driving adapter calls into the business layer, by way of a Port. The driving adapters can generally be thought of as the "presentation layer". It could be a web application, a desktop application, a _CLI_, anything that initiates some action on the business domain.

A driven adapter is called by the business layer, to interact with some backend tool, ie. a database, storage bucket, cache, etc. The business layer calls into the driven adapter by way of the Port. **Driven adapters implement the Port defined by the business layer**.

So the flow generally looks like

```
Driving Adapter <--> Port <--> Business Layer <--> Port <--> Driven Adapter
```

## Benefits

Because the business layer enforces the Ports, and all external interactions with external components happens through the Ports, the business layer is encapsulated. The benefits of this for the system cannot be overstated.

It means the business layer, the models and the rules governing them, can be developed _before_ choosing things like a database, or a frontend framework. Better yet, the business layer can be _tested_ before choosing any of those things. **Covering business logic almost entirely with unit tests is a boon for confidence in the system.**

> When building software, a decision should be conceptualized as a set of _constraints_, and ideally the pros of accepting those constraints outweigh the cons. So we ought to defer accepting constraints until we have as much information as possible to inform that decision. Clean Architecture enables us to do just that.

It also allows for the separation of concerns. Each tier of the architecture can change without requiring changes in the other tiers. This is important because some tiers are more volatile than others; typically the UI of an application changes faster than business rules for example.

> The only time we must touch multiple tiers is if a Port is changed. And that is usually a find and replace

## hyper Lingua Franca 📚

![hyper-architecture](/hyper-architecture.png)

### hyper Apps 🎮

The Driving Adapters in the hyper Service Framework are called `Apps` or `Apis`. The hyper Core team maintains
an HTTP-based RESTful hyper `App` implementation, using the popular Web
Server framework [express](https://expressjs.com/). You can see the API Reference [here](/docs/api-reference/rest/index)

In the future, we would like to see more app offerings. A CLI app, a GRPC app, we've even discussed a Service Worker app, so that hyper could be run entirely in the browser, on a Service Worker 😎.

### hyper Core 🪨

The business layer in hyper is called [core](https://github.com/hyper63/hyper/tree/main/packages/core) which contains all of the business logic and enforces each Port. Core also defines the Port that a hyper `App` invokes.

### hyper Ports 🔌

There are multiple Ports defined in the hyper Service Framework. The current ones are `Data`, `Cache`, `Storage`, `Queue`, and `Search`.

### hyper Adapters 🛠

The Driven Adapters in The hyper Service Framework are simply called `Adapters`. You can see many of them that the Core team has implemented [here](https://github.com/hyper63?q=hyper-adapter&type=all&language=&sort=). Each adapter implements a `Port` and does the heavy lifting of communicating with an underlying technology being used to power the `Port`.

### hyper Services

A hyper `Service` is combination of the components described above:

- A hyper `App`
- hyper Core
- An `Adapter` Port
- A hyper `Adapter`

For example, a hyper `Data` Service might be:

```
RESTful api -> Core -> Data Port -> CouchDB Adapter
// or
GraphQL api -> Core -> Data Port -> Postgres Adapter
// or
CLI -> Core -> Data Port -> DynamoDB Adapter
```

A hyper `Cache` Service might be:

```
GRPC api -> Core -> Cache Port -> Redis Adapter
// or
GraphQL api -> Core -> Cache Port -> Sqlite Adapter
// or
CLI -> Core -> Cache Port -> FlatFile Adapter
```

A hyper `Search` Service might:

```
GRPC api -> Core -> Search Port -> Elasticsearch Adapter
// or
RESTful api -> Core -> Search Port -> Minisearch Adapter
// or
CLI -> Core -> Search Port -> Algolia Adapter
```

I hope you're noticing something:

**`Adapters` and `Apps` are _interchangeable_**. This is how we can test our business layer without choosing a database, for example. We can simply stub the `Adapter` that implements the `Port` that the core business logic interacts with.

## hyper Server

A hyper `Server` is an instance that hosts multiple hyper `Services` and may be consumed via whatever the hyper `App` api exposes.

## hyper Domain

hyper `Services` are created on a hyper `Server`, within a hyper `Domain`.

A `Domain` is simply a logical grouping of hyper `Services` hosted on a hyper `Server`.

hyper `Domains` are commonly used to distinguish a set of hyper `Services` leveraged by an application.
For example, if you had `foo` application and a `bar` application, they each might have their own `Domain` and own connection string to the hyper `Server`:

```js
const connect = require("hyper-connect");

const DOMAIN = "foo";

const { data, cache } = connect(`https://${SUB}:${SECRET}@HOST/${DOMAIN}`);

// Create a Data Service and Cache Service in the foo domain
await data.create();
await cache.create();

// #############################
// In another deployable, or perhaps a logically-separated
// part of the same deployable ie. Modular-Monolith
// ##############################

const DOMAIN = "bar";

const { data, storage } = connect(`https://${SUB}:${SECRET}@HOST/${DOMAIN}`);

// Create a Data Service and Storage Service in the bar domain
await data.create();
await storage.create();
```

:::info
A `Connection String` used with `hyper-connect` is ALWAYS tied to a single hyper `Domain`. If you need to consume multiple `Domains` in the same context, simply instantiate multiple instances of `hyper-connect`, like in the example above.
:::
