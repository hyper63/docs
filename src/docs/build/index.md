# Build on hyper

The hyper Service Framework is built using the
[Ports and Adapters](/docs/concepts/clean-cloud-architecture) architecture. Hyper's core business logic is driven by a Driving Adapter

The general idea with Ports and Adapters is that the business logic layer defines the models and rules on how they interact with each other, and also a set of consumer-agnostic entry and exit points to and from the business layer. These entry and exit points are called "Ports". All components _external_ to the business layer, interact by way and are interacted with through, the Ports. A Port defines an api, and knows nothing about the inner mechanism -- that's an Adapter's job.

Adapters perform the actual communication between external actors and the business layer. There are generally two types of Adapters: "Driving Adapters" and "Driven Adapters".

A driving adapter calls into the business layer, by way of a Port. The driving adapters can generally be thought of as the "presentation layer". It could be a web application, a desktop application, a _CLI_, anything that initiates some action on the business domain.

A driven adapter is called by the business layer, to interact with some backend tool, ie. a database, storage bucket, cache, etc. The business layer calls into the driven adapter by way of the Port. **Driven adapters implement the Port defined by the business layer**.

So the flow generally looks like

```
Driving Adapter <--> Port <--> Business Layer <--> Port <--> Driven Adapter
```
