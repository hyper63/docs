# The `hyper` Config File

The config file is the core manifest for hyper, it pulls all of the adapters into the fold and configures, and applies them to the core module.

The config file is where you choose the `App` and set of `Adapters` you would like hyper `Core` to use. The hyper Service Framework uses a config file to bootstrap the hyper `Server` with the provided `App` and `Adapter`.

A Config file will look like this:

::: code-group

```js [hyper.config.js]
// hyper driving adapter
import express from "https://raw.githubusercontent.com/hyper63/hyper/hyper-app-express%40v1.2.1/packages/app-express/mod.ts";

// hyper driven adapters
import mongodb from "https://raw.githubusercontent.com/hyper63/hyper-adapter-mongodb/v3.3.0/mod.ts";
import redis from "https://raw.githubusercontent.com/hyper63/hyper-adapter-redis/v3.1.2/mod.js";

import { auth } from "./auth.ts";

export default {
  app: express,
  adapters: [
    { port: "data", plugins: [mongodb({ url: Deno.env.get("MONGO_URL") })] },
    { port: "cache", plugins: [redis({ url: Deno.env.get("REDIS_URL") })] },
    // ... any other adapters
  ],
  middleware: [auth],
};
```

```ts [auth.ts]
import { jwt, type express } from "./deps.ts";

/**
 * Given a sub and secret, return a hyper Custom Middleware that will
 * check that all incoming requests have a properly signed jwt token
 * in the Authorization header as a bearer token
 */
export const auth =
  ({ sub, secret }: { sub: string; secret: string }) =>
  (app: express.Express) => {
    /**
     * Extract the bearer token from the header, and verify it's
     * signature and sub matches expected
     */
    const verify = async (header: string) => {
      const payload = await jwt
        .verify(header.split(" ").pop() as string, secret, "HS256")
        .catch(() => {
          throw { name: "UnauthorizedError" };
        });
      /**
       * Confirm sub matches
       */
      if (payload.sub !== sub) throw { name: "UnauthorizedError" };
    };

    app.use(async (req, _res, next) => {
      await verify(req.get("authorization") || "Bearer notoken")
        .then(() => next())
        // pass error to next, triggering the next error middleware to take over
        .catch(next);
    });

    app.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): unknown => {
        if (err && err.name === "UnauthorizedError") {
          return res.status(401).send({ ok: false, msg: "not authorized" });
        }
        // Trigger the next error handler
        next(err);
      }
    );

    return app;
  };
```

:::

You can then invoke hyper `Core` in the same directory using `Deno`:

```sh
deno run -A https://raw.githubusercontent.com/hyper63/hyper/hyper%40v4.3.2/packages/core/mod.ts
```

This will download hyper `Core`, load your configuration file, and start up a hyper `Server` using the `App`, `Middleware` and `Adapters` you've specified in the config.

## Start hyper Programmatically

You can also start hyper by importing it using `Deno`

```ts
import hyper from "https://raw.githubusercontent.com/hyper63/hyper/hyper%40v4.3.2/packages/core/mod.ts";

hyper({
  // your hyper config here
});
```
