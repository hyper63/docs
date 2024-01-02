# Custom hyper Adapter

A [hyper Driven Adapter](/docs/concepts/clean-cloud-architecture#hyper-adapters-🛠) implements one of Ports defined in hyper `Core`.

The current `Ports` in hyper are `Data`, `Cache`, `Storage`, `Queue`, and `Search`.

:::info
Generally we refer to an `Adapter` that implements the `Data` port as a `Data Adapter`
:::

The Core team has [implemented many `Adapters`](https://github.com/hyper63?q=hyper-adapter&type=all&language=&sort=), but you can also build your own! For example, maybe you need to power a hyper `Service` using technology not already implemented by an existing `Adapter`, or maybe there are specific use-cases where a custom adapter is needed.

In any case, any implementation of a `Port` can be given to hyper `Core` via the [hyper Config File](/docs/host/hyper-config). If the `Port` is correctly implemented, hyper will use it!

:::info
In this sense, hyper `Core` simply consumes an API. It's the `Adapters` job to implement that API
:::

## Adapter Plugins

So an adapter is a complete implementation of a core-defined `Port`. An adapter is where the "meat" of an external service integration lies, and implementation will look different for each `Adapter`. Though the structure used to provide hyper with an `Adapter` is always the same.

hyper defines a plugin interface that will need to be implemented in order to use it with a hyper `Port`

:::info
`Adapters` technically implement the `plugin` interface, whose `link` method then builds the implementation for the specific `Port`
:::

### Structure

`Adapters` are provided to hyper through the use of plugins. A hyper `Adapter` plugin is an object that implements one method: `link`. There are other optional fields, and their types are enforced if defined. Here are the TypeScript types for a hyper adapter plugin:

```ts
type HyperPortAdapterConfig = Record<string, unknown>;

type HyperPortAdapter = Record<String, Function>;

type AdapterPluginLoad = (
  config: any
) => HyperPortAdapterConfig | Promise<HyperPortAdapterConfig>;

type AdapterPluginLink = (
  config: HyperPortAdapterConfig
) => (next: HyperPortAdapter | null) => HyperPortAdapter;

export interface HyperAdapterPlugin {
  id?: string;
  port?: "storage" | "data" | "cache" | "search" | "queue";
  load?: AdapterPluginLoad;
  link: AdapterPluginLink;
}
```

For the sake of brevity, the plugin examples given below will implement an imaginary `Port`, "`echo`", that requires an adapter to implement the following interface:

```ts
export interface EchoAdapter {
  echo({ name }: { name: string }): Promise<string>;
}
```

Once a plugin is defined it can be provided to hyper through the [hyper Config File](/docs/host/hyper-config):

```ts [hyper.config.js]
const echoAdapterPlugin = {
  link: () => () => ({
    echo: ({ name }: { name: string }) => Promise.resolve(`Hello ${name}`)
  })
}

export default {
  ...,
  adapters: [
    { port: 'echo', plugins: [echoAdapterPlugin] }
    ...
  ]
}
```

Assuming your plugin provides a valid implementation of the "echo" port, hyper now has what it needs to use your adapter in the hyper Service Framework.

### Adapter Plugin `load` and `link`

An adapter plugin's `link` and `load` functions are called by hyper, when the hyper `Server` is bootstrapping, to construct the `Adapters` hyper `Core` then uses to communicate with external services. Let's take a moment to understand what each of these functions are meant to do.

#### `load`

The `load` function on an adapter plugin is called by hyper on startup. The `load` function takes an object as a parameter and then returns an object or a `Promise<object>`. The output of `load` is what hyper will pass to the `link` function.

The purpose of `load` is to prepare any configuration your adapter will need during the `link` phase. Let's say we have an adapter that needs to read values from the environment and set some configuration. We can do this in the load function:

```ts
const echoAdapterPlugin = {
  load: () => {
    const timeout = parseInt(Deno.env.get("ECHO_TIMEOUT") || "60000");
    const host = Deno.env.get("ECHO_HOST");
    const port = Deno.env.get("ECHO_PORT");

    return { timeout, host, port };
  },
};
```

Since `load` can also return a `Promise`, it can be used for Asynchronous setup as well ie. fetching credentials from an endpoint in a secured VPC.

Now when hyper calls the `link` function next, it will pass the `{ timeout, host, port }` as a parameter. If `load` is not implemented, hyper will simply pass `undefined` to the `link` function.

#### `link`

The `link` function on an adapter plugin is called by hyper on startup, directly after `load`. This is where your plugin will ultimately need to return an implementation of a hyper `Port`.

### Advanced: Composing Plugins to Build Full Adapters

Recall the signature of the `link`:

```ts
type HyperPortAdapterConfig = any;

type HyperPortAdapter = Record<String, Function>;

type AdapterPluginLink = (
  config: HyperPortAdapterConfig | undefined
) => (next: HyperPortAdapter | undefined) => HyperPortAdapter;
```

We can see that the `link` accepts a config which is the result of the `load` function or `undefined` if the `load` function is not provided. Then what is returned is another function that looks like this:

```ts
(next: HyperPortAdapter | undefined) => HyperPortAdapter;
```

This may seem strange at first glance. Recall the shape of each object in the array passed to adapters in the hyper Config File:

```ts
const echoAdapterPlugin = {
  link: () => () => ({
    echo: ({ name }: { name: string }) => Promise.resolve(`Hello ${name}`)
  })
}

export default {
  ...,
  adapters: [
    { port: 'echo', plugins: [echoAdapterPlugin] } // an array of plugins
    ...
  ]
}
```

Notice what is provided to plugins is an array of plugins, for each `Port`. This suggests that hyper allows passing more than one plugin, which it does!

```ts
const echoAdapterPlugin = {
  link: () => () => ({
    echo: ({ name }: { name: string }) => Promise.resolve(`Hello ${name}`)
  })
}

const loggingEchoPlugin = {
  link: () => next => {
    console.log("Look Ma', composition!")

    return {
      echo: ({ name }) => {
        console.log(`echoing now with name ${name}`)
        return next.echo({ name })
      }
    }
  }
}

const exclamationEchoPlugin = {
  link: () => next => {
    console.log("Look Ma', more composition!")

    return {
      echo: async ({ name }) => {
        const greeting = await next.echo({ name })
        return `${greeting}!`
      }
    }
  }
}

export default {
  ...,
  adapters: [
    {
      port: 'echo',
      plugins: [
        loggingEchoPlugin,
        exclamationEchoPlugin,
        echoAdapterPlugin
      ]
    }
    ...
  ]
}
```

Underneath the hood, hyper **composes** the functions returned from `link`, using the "onion" principle. Each of these functions is passed `next` which is the result of the next link in the array passed to plugins.

This means each `link` wraps the next `link` in the chain! Each `link` can choose to call an API on the next `link`, or just return data which then travels back up the chain! This enables powerful approaches for combining plugins to produce complex adapter behavior.

![hyper plugin chain link](/link-chain.jpeg)

Links that do not call anything on `next` are referred to as "Terminating Links" because they do not propagate data "down" the chain and instead return data back "up" the chain. A `link` chain will need to have at least one terminating `link` to be implemented, for each `Port` defined API. For the last `link` in the chain, next will be an empty object.

We will dive more into what can be done with this later. For now, just understand that this composition is the reason for the interesting signature of `link`.

:::info
Plugin Linking is an advanced concept; you probably don't need it.

As a general rule of thumb, your `Adapter` probably will not need to use `next` if it fully implements the `Port` and does not call `next`
:::

### Adapter Plugin Lifecycle

When the hyper service first starts, it will evaluate a provided [hyper Config File](/docs/host/hyper-config). Then for each `Adapter` definition in the `adapters` array, hyper will grab the array of plugins passed to plugins, and call their `load` functions, if implemented, passing the output of each `load` function into the next `load` function. The final result is the final value passed to `link`.

Once all load functions have been called, the result is then passed into each `link` function. This will produce a list of functions that Hyper then "chains" together, passing each `link` to the next `link` in the chain as `next`. The result of this composition is an object. That object is then wrapped with the corresponding hyper defined `Port`, to ensure it properly implements the `Port`.
