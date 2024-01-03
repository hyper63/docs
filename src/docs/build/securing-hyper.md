# Securing your hyper Server

In most cases, the hyper Server will need to validate incoming requests, so as to prevent unwanted access to hyper `Services` running on the hyper `Server`.

A common practice is to add [Custom Middleware](/docs/build/middleware) to the hyper Config that is added to the hyper `Server` and enforces the AuthN/Z desired. For example, when using an HTTP based hyper `App`, a `Custom Middleware` could be used to check and verify incoming requests, perhaps a `Bearer` token in the `Authorization` header.

Here is what that middleware might look like, when using the pre-built App [`app-express`](https://github.com/hyper63/hyper/tree/main/packages/app-express):

::: code-group

```ts [hyper.config.ts]
import { appExpress, hyper, jwt, type express } from './deps.ts'
/**
 * Given a sub and secret, return a hyper Custom Middleware that will
 * check that all incoming requests have a properly signed jwt token
 * in the Authorization header as a bearer token
 */
const authMiddleware =
  ({ sub, secret }: { sub: string; secret: string }) =>
  (app: express.Express) => {
    /**
     * Extract the bearer token from the header, and verify it's
     * signature and sub matches expected
     */
    const verify = async (header: string) => {
      const payload = await jwt
        .verify(header.split(' ').pop() as string, secret, 'HS256')
        .catch(() => {
          throw { name: 'UnauthorizedError' }
        })
      /**
       * Confirm sub matches
       */
      if (payload.sub !== sub) throw { name: 'UnauthorizedError' }
    }

    app.use(async (req, _res, next) => {
      await verify(req.get('authorization') || 'Bearer notoken')
        .then(() => next())
        // pass error to next, triggering the next error middleware to take over
        .catch(next)
    })

    app.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ): unknown => {
        if (err && err.name === 'UnauthorizedError') {
          return res.status(401).send({ ok: false, msg: 'not authorized' })
        }
        // Trigger the next error handler
        next(err)
      }
    )

    return app
  }

export default hyper({
  app,
  adapters: [...],
  /**
   * Add the custom middleware in the hyper Server configuration
   */
  middleware: [authMiddleware({ sub: Deno.env.get('SUB'), secret: Deno.env.get('SECRET') })]
})
```

:::

This is by-far the most common approach for securing an HTTP-based hyper `Server`.

## Connection String with `hyper-connect`

Because the above approach is so common, `hyper-connect` ships with the ability to automatically generate short-lived JSON Web Tokens (JWTs) using the credentials provided in the `connection string`.

```js
import { connect } from 'hyper-connect'

const { data } = connect('https://user:password@hyper.host/foobar')

/**
 * hyper-connect will automatically generate a JWT, whose sub is "user"
 * and is signed using "password" and the HS256 algorithm
 */
await data.add({...})
```

No matter which way you secure your hyper `Server`, make sure you include the appropriate credentials when consuming it.
