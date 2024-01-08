# Why hyper

<br/>

<p align="center">
  <img alt="pentagon of hyper services" src="/pentagon.svg" />
</p>

<br/>

Read the full story about [Why we started hyper](https://blog.hyper.io/why-start-hyper/)

## Software Development is Hard

Desigining software to encapsulate business rules, that exist in the bonafide world, requires deeply understanding the problem domain. These rules are incredibly diffcult to communicate (most hard problems boil down to communication ones), incredibly difficult to get right in code, and nearly impossible to get it right in code, the first time.

> The [Halting Problem](https://en.wikipedia.org/wiki/Halting_problem) demonstrates that, as software developers, we could never test for the total absence of bugs in our code, only the presence of them.

Even if we _did_ manage to get it right, by some miracle, those real-life business rules (aka. requirements) will inevitably change; it's not a question of "if", but "when".

Knowing this, the software must be written in such a way that is able to _change_ over time, honing in the ever-shifting problem domain, and hopefully such that changing it doesn't produce a "blast radius" effect across the entire codebase.

::: info
The ease of which code can change to fulfill some set of requirements can be referred to as "Software Architecture".

Indeed, one of the key quality indicators of a piece of code is it's ability to be modified without breaking something else unrelated.

Software Architecture is often-times _derived_ from things like network topology -- the deployable units, the tools we use aka. libraries, lanugages, and frameworks, or the process our team follows, but they are **not** the same thing.
:::

Given all of this, a fair conclusion is that software development is a hard problem and will continue to be, as long as requirements change -- and they always will.

### Unintended Technical Debt

Too many times, technical debt, coupling, and complexity arise, not from a software teams inability to design software well (although we humans are pretty bad at predicting the future), but because of short deadlines, tight budgets, lack of speciailization, or security compliance.

Through no fault of the team, technical debt can start to creep into a Product. Over time, this unintended burden can slow productivity to a crawl, causing frustrations for the business, customer, and perhaps most importantly the teams maintaining the software.

## The Scaling Dilemma

Once organizations achieve product-market fit, their application often requires restructuring to accommodate growth aka “scale”.

![scaling dilemma](/scale.png)

Because Cloud providers are increasingly complex, increasingly specialized, and sticky by design, the decision “to scale” results in drastic upfront costs and ever-increasing recurring costs to iterate.

Organizations sputter out attempting to achieve scale, due to these costs.

## Why hyper?

This is why we started hyper, a company focused on solving this problem, by providing services and patterns that change a developer's mindset about how to design software and build software systems.

This is not novel or magic, many leaders in our industry have been sharing these patterns in the form of principles, architectures, and paradigms, but the status quo far outweighs these pragmatic concepts:

- Functional Thinking
- General to Specific (Clean Architecture)
- Continuous Delivery

Applying these core concepts, software developers can create high-performing development teams and cost-efficient software maintenance. Each of these concepts requires discipline and commitment to the principles and practices of each concept. They are not easy things to do -- one change to change the way they approach solving problems.

The first part of this puzzle is our solution to Clean Cloud Architecture: **The hyper Service Framework**.

### The hyper Service Framework Upgrades Software for Growth

<br/>

![](/all.svg)

hyper is the name of our company, but is also the name of our service framework -- The hyper Service Framework is a collection of core application services wrapped in a common API.

Instead of tightly connecting your application business logic to the cloud services and products your app depends on, The hyper Service Framework enables you to loosely couple these cloud services, giving your application clear separation and future extensibility and scalability.

hyper takes a different approach than the legacy service management architectures. This approach improves maintainability and drastically decreases unintended technical debt.

Using The hyper Service Framework places a context-bound API on top of the services tier, and encourage business logic encapsulation _away_ from this layer, embracing change in the underlying software a core design principle.

This separation can provide productive semantics that keeps the cost of changing a business rule as low as possible. A side-effect of this pattern is that it provides the ability to swap or exchange service or interface without having to re-write all of the specific business rules.

### Team Domain Focus

By providing a simple and extensible API for the Cloud, the hyper Service Framework decouples business services from the Cloud services and infrastructure that power them.

Software teams are freed to focus on their core responsibilities, without blocking other teams, and without compromising on delivery.

Hyper organizations tame technical debt, using Clean Cloud Architecture, to sensibly scale their software and software teams, only when it’s needed, not all up-front.
