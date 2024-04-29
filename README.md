# OpenCRUD

Serverless Redis CRUD Server that generates OpenAPI.

# Goals

- Easy creation of authenticated, scalable CRUD Server with a realtime database (without coding)
- Intended to be used for agentic AI
- Perfect model-specific OpenAPI specification
- Ability for user to bring their own Redis, or clone the repo and change anything.

# Non-goals

- 🔥 For now, forget ActionSchema and focus on a JSON-Schema CRUD. Having an ability to quickly create this is very useful.
- ❗️ Having users with ratelimits or stuff like that is not the goal! This is just a demo and intention is for it to be used via a clone with your own db behind it.

# Installation

You can use the demo to create your CRUD via my root database. You can use your own Upstash by providing these headers.

If you want to host this yourself, simply clone this and host it on Vercel.

Please ensure to provide upstash credentials in `.env.local`:

```
X_UPSTASH_EMAIL=
X_UPSTASH_API_KEY=
```

You still need more credentials though. After putting these creds, please run ` npm run init-db` to create the root db with credentials.

When deploying, copy the settings into your production environment variables as well.

# Ideas

- Use the default Vercel upstash if that has a good free plan and can be easily set up.
