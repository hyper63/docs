# Glossary

### hyper Apps 🎮

The Driving Adapters in the hyper Service Framework are called `Apps` or `Apis`. This is the public interface used to interact with the hyper `Server`

### hyper Core 🪨

The business layer in hyper that contains all of the hyper business logic and enforces each `Port`. `Core` also defines the `Port` that a hyper `App` invokes to interact with `Core`.

### hyper Ports 🔌

The service primitive APIs defined in hyper `Core`. There are multiple `Ports` defined in the hyper Service Framework. The current ones are `Data`, `Cache`, `Storage`, `Queue`, and `Search`.

### hyper Adapters 🛠

The Driven Adapters in The hyper Service Framework. Each `Adapter` implements a hyper `Port` and does the heavy lifting of communicating with an underlying technology being used to power the `Port`.

Generally, these are referred using the hyper `Port` names ie. `Data` Adapter, `Cache` Adapter, `Storage` Adapter, `Queue` Adapter, and `Search` Adapter

You can see many of them that the Core team has implemented [here](https://github.com/hyper63?q=hyper-adapter&type=all&language=&sort=)

### hyper Services

The composed components described above:

- A hyper `App`
- hyper `Core`
- A hyper `Adapter`

Generally, these are referred using the hyper `Port` names ie. `Data` Service, `Cache` Service, `Storage` Service, `Queue` Service, and `Search` Service

## hyper Server

A hyper instance that hosts hyper `Services` and may be consumed via the hyper `App` public API.

## hyper Domain

hyper `Services` are created on a hyper `Server`, within a hyper `Domain`.

A `Domain` is simply a logical grouping of hyper `Services` hosted on a hyper `Server`.

hyper `Domains` are commonly used to distinguish sets of hyper `Services` across applications ie. a `Foo App` `Domain` and `Bar App` `Domain`.
