# OpenAPI Combination Proxy

This repo can be used as a template. It hosts an `OpenAPIProxy` in a serverless environment.

Goals:

- You often don't require all endpoints from all your APIs and this may clutter your overview, SDK and bundle.
- The ability to combine APIs into a single new OpenAPI Spec and get it hosted, can be useful for LLM Agents.

Non-goals:

- Improving or adding certain opinionation into the specification. For that, we can use the [enhancement-proxy](https://github.com/CodeFromAnywhere/openapi-enhancement-proxy-next). In this project OpenAPIs are only pruned and combined, nothing else.
- This principle can also be implemented on the client-side to remove a layer every request has to go to, however, this is not in the scope of this project, but be welcome to use this as inspiration!

# Is this really needed?

The reason I'm working on the combination proxy was that OpenAI (and other LLM agent providers) require you to fill in an OpenAPI Spec. I assumed that, in order to combine multiple openapis, you'd need to proxy the traffic as you can't define more servers. However, it's also possible to define servers on the operation level (see https://learn.openapis.org/specification/servers.html). The problem is though that there may be conflicting endpoints (unlikely but possible). Especially when you're trying to make a combination of e.g. 2 agents that are the same api just a different server, we can't use the above.

Further more, different servers require different authentication, and this can't be defined in OpenAPI 3.0.x (the version I use most). SecurityScheme is only defined in `#/components/securitySchemes`, and the convention is that only one of the security mechanisms needs to be in place. In order to accomodate for using multiple servers with differnt alternatives of authenticating, we need something that can do that.

Last but not least, pruning and presetting parameters in operations could be useful. Pruning could be done with your own schema, but presetting won't be possible. Not sure though if my solution is perfect, but it's definitely something that will improve things quite a lot. Furthermore, it's super easy to host it yourself, so why wouldn't you?

## Conclusion

- If you have simple unauthenticated OpenAPIs you wish to combine you can specify the servers at operation-level and won't need a proxy [[1]](https://learn.openapis.org/specification/servers.html).
- If you wish to add complex code to do preprocessing and post-processing on your endpoints, you would be better off making your own OpenAPI completely and call the other providers using an SDK. An example of how to do this can be found [here](https://github.com/CodeFromAnywhere/next-openapi-demo)
- If you want a quick OpenAPI spec that combines multiple endpoints from multiple services, without writing any code, this is for you.
