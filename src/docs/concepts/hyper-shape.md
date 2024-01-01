# hyper Response Shape

Most hyper APIs will return a "hyper" shape like the following:

```ts
interface HyperResult = {
  ok: boolean,
  status?: number,
  msg?: string
}
```

`ok` is always provided and is `true` if the operation was successful, and `false` if the operation was not successful. When `ok` is `true`, there MAY be additional fields on the result, which depends on the specific operation being performed (see [API Reference](/docs/api-reference/index)). When `ok` is `false`, An optional `status` and `msg` can be included to provide additional context.

> The hyper `Server` does not enforce any semantics on `status` or `msg`, besides their types. It is up the hyper `Service` Adapter to set `status` and/or `msg`. When an error occurs, a common paradigm for adapters is to use an HTTP status code for `status`, and `msg` as a free text field to provided additional context.

## `hyper-connect` and the hyper Response Shape

`hyper-connect` will NOT throw unless:

- A network error occurs, for example a TCP connection being dropped
- A `5xx` status code is received from the hyper `Server`

This means your business logic SHOULD check `ok` property and subsequently `status` and `msg` (checking `status` is most common) in the resolved result. **This is by design**, as it encourages business logic to handle sad paths when interacting with the services tier.
