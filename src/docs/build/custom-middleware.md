# Build a Custom hyper App Middleware

hyper `Middleware` allows you to add additional functionality to a hyper `App`. A common use-case is to enforce authN/Z on the hyper `Server`.

In the [hyper Config file](/docs/host/hyper-config), you may specify an array of `middleware`. This `middleware` is then passed to the hyper `App` under `services.middleware`.

:::info
It is up to the hyper `App` implementation to properly apply the `Middleware` to itself.

In other words, the `Middleware` is specific to an `App` implementation
:::

For example, say you're using the HTTP-based RESTful `App` built on `express` (See [here](/docs/api-reference/rest/index)). That `App` implementation expects `Middleware` to be of the shape:

```ts
type HyperExpressAppMiddleware = (app: Express) => Express;
```

Because hyper is modular and in this case using `express`, you could use any `express` framework middleware to manage your authentication process. You can add more advanced security checks for each hhyper `Service` resource or even for a specific `Domain`.

For example, let's say you only wanted certain clients to be able to create or destroy hyper `Data` Services on your hyper `Server`.

You would modify your `Middleware` to perform special checks based on those endpoints.

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
