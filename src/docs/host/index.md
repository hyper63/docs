# Hosting a hyper Server

hyper runs on [`Deno`](https://deno.com/), so in order to host a hyper `Server` you will need the `Deno` runtime.

Besides that, hosting a hyper `Server` is simple with a tool like `Docker`. For example:

::: code-group

```Dockerfile [Dockerfile]
FROM denoland/deno:alpine

WORKDIR /app

# Prefer not to run as root.
USER deno

COPY mod.ts .
RUN deno cache mod.ts

ADD . .

CMD ["run", "-A", "mod.ts"]

```

```ts [mod.ts]
// hyper Core
import hyper from "https://raw.githubusercontent.com/hyper63/hyper/hyper%40v4.3.2/packages/core/mod.ts";

// hyper App
import express from "https://raw.githubusercontent.com/hyper63/hyper/hyper-app-express%40v1.2.1/packages/app-express/mod.ts";

// hyper Adapters
import mongodb from "https://raw.githubusercontent.com/hyper63/hyper-adapter-mongodb/v3.3.0/mod.ts";
import redis from "https://raw.githubusercontent.com/hyper63/hyper-adapter-redis/v3.1.2/mod.js";
import minio from "https://raw.githubusercontent.com/hyper63/hyper-adapter-minio/v1.0.1/mod.js";

// Programmatically start hyper
hyper({
  app: express,
  adapters: [
    { port: "data", plugins: [mongodb({ url: Deno.env.get("MONGO_URL") })] },
    { port: "cache", plugins: [redis({ url: Deno.env.get("REDIS_URL") })] },
    // ... any other adapters
  ],
});
```

:::

That's it! You can deploy that image to any containerization environment.
