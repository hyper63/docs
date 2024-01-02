# API Reference (HTTP-based REST 🛌)

The hyper Service Framework is built using the
[`Ports and Adapters`](/docs/concepts/clean-cloud-architecture) architecture, and so can be presented (and
consumed) using any [hyper Driving Adapter aka. `App`](/docs/build/custom-app) implementation.

However, a common presentation of hyper is an HTTP-based RESTful API. The hyper Core team maintains
an HTTP-based RESTful [hyper `App`](/docs/build/custom-app) implementation, using the popular Web
Server framework [express](https://expressjs.com/).

This hyper `App` exposes each of the core hyper Services as a set of REST resources:

- [`Data`](data): hyper `Data` Services available on the hyper `Server`
- [`Cache`](cache): hyper `Cache` Services available on the hyper `Server`
- [`Storage`](storage): hyper `Storage` Services available on the hyper `Server`
- [`Queue`](queue): hyper `Queue` Services available on the hyper `Server`
- [`Search`](search): hyper `Search` Services available on the hyper `Server`

:::tip
Be sure to include any appropriate authN/Z on the request. See [Securing your hyper `Server`](/docs/build/securing-hyper)
:::
