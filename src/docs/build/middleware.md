# hyper App Middleware

hyper `Middleware` allows you to extend the hyper `App` interface to support opinionated features, without having to modify the `Core` interface.

`Middleware` should be function that receives the `App` instance as a parameter and returns the `App` instance, creating a chain-able collection of middleware. For example, with `express`:

```ts
type HyperExpressAppMiddleware = (app: Express) => Express;
```

:::info
It is up to the hyper `App` implementation to properly apply the `Middleware` to itself.

In other words, the `Middleware` is specific to an `App` implementation
:::

## Middleware Examples

A common use-case is to enforce authN/Z on the hyper `Server`. Here is an example of a JWT verifying middleware when using an `express`-based `App` (See [here](/docs/api-reference/rest/index)):

```ts
import jwt from 'npm:express-jwt'

const auth = (app) => {
  app.use(jwt({
    secret: process.env.SECRET,
    algorithms: ['HS256']
  }).unless({ path: ['/', /^\/data$/] }))

  app.use('/data', jwt({
    secret: process.env.ADMIN_SECRET,
    algorithms: ['HS256']
  })

  app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send({ok: false, msg: 'not authorized'})
    }
  })

  return app
}
```

Because hyper is modular and in this case using `express`, you could use any `express` framework middleware to manage your authN/Z process. You can add more advanced security checks for each hyper `Service` resource or even for a specific `Domain`.

For example, let's say you only wanted certain clients to be able to create or destroy hyper `Data` Services on your hyper `Server`.

You would modify your `Middleware` to perform special checks based on those endpoints.

**Other common use-cases:**

- Throttling
- Additional Routes for other services, like email, or maybe _serving_ files in a hyper `Storage` service

## Applying Middleware

Once you've created your middleware, you'll want to apply it to your hyper `Server`

In the [hyper Config file](/docs/host/hyper-config), you may specify an array of `middleware`. This `middleware` is then passed to the hyper `App` as `services.middleware` by hyper `Core`

```js hyper.config.js
import { auth } from "./auth.js";

export default {
  app: express,
  adapters: [
    /*...*/
  ],
  middleware: [auth],
};
```
