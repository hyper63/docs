# API Reference

The hyper Service Framework is built using the
[Ports and Adapters](/docs/concepts/clean-cloud-architecture) architecture, and so can be presented using
any hyper `App` implementation.

For example, a hyper App may choose to expose an HTTP-based RESTful API, for consuming the hyper
Server over HTTP using REST semantics, while another hyper App may choose to expose an HTTP-based
GraphQL API. The hyper Service Framework itself is presentation agnostic -- it's whatever the hyper
`App` implementation chooses to expose!

The hyper Core team has already built some hyper Driving Adapters:

- [HTTP-based and RESTful](/docs/api-reference/rest/index)
- More to come!
