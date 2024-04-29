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

# Getting started

To try this out, simply navigate to https://data.actionschema.com and follow the steps there.

# Privacy

By default, your databases with provided schemas will be stored in a central Upstash Redis KV database. When creating your database, you can change the region as you wish.

It's possible to use the OpenCRUD with your own Upstash credentials so your data will stay in your own data store. However, we will still store your upstash credentials in our main store, so beware.

If you really want it to be private from us, you can self-host this by cloning the repo and hosting it on a serverless hosting service for Next.js projects (like Vercel).

# Self-hosting

1. `git clone https://github.com/CodeFromAnywhere/opencrud.git`
2. `cd opencrud && npm i`
3. `cp .env.local.example .env.local` and provide the credentials needed
4. Run `npm run init-db` to create the root-db (and regenerate `.env.local`)
5. When deploying, copy the settings into your production environment variables as well.

# Ideas

- Use the default Vercel upstash if that has a good free plan and can be easily set up.
