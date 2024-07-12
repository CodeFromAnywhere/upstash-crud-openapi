const origin = `https://data.actionschema.com`;
const openapiUrl = `${origin}/${props.params.databaseId}/openapi.json`;

const links = [
{
title: "Swagger",
url: `https://petstore.swagger.io/?url=${openapiUrl}`,
},
{
title: "Swagger Editor",
url: `https://editor.swagger.io/?url=${openapiUrl}`,
},
{
title: "OpenAPI GUI",
url: `https://mermade.github.io/openapi-gui/?url=${openapiUrl}`,
},
{
title: "Stoplight",
url: `https://elements-demo.stoplight.io/?spec=${openapiUrl}`,
},

    {
      title: "ActionSchema Combination Proxy",
      url: `https://proxy.actionschema.com/?url=${openapiUrl}`,
    },

    {
      title: "Source",
      url: openapiUrl,
    },

];
