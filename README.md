# OpenAPI Combination Proxy

This repo can be used as a template. It hosts an `OpenAPIProxy` in a serverless environment.

Goals:

- You often don't require all endpoints from all your APIs and this may clutter your overview, SDK and bundle.
- The ability to combine APIs into a single new OpenAPI Spec and get it hosted, can be useful for LLM Agents.

Non-goals:

- Improving or adding certain opinionation into the specification. For that, we can use the [enhancement-proxy](https://github.com/CodeFromAnywhere/openapi-enhancement-proxy-next). In this project OpenAPIs are only pruned and combined, nothing else.
- This principle can also be implemented on the client-side to remove a layer every request has to go to, however, this is not in the scope of this project, but be welcome to use this as inspiration!
