export default function Homepage(props: { params: { databaseId: string } }) {
  const openapiUrl = `https://data.actionschema.com/${props.params.databaseId}/openapi.json`;
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

  return (
    <div className="p-10">
      <h1 className="text-3xl py-10">{props.params.databaseId}</h1>
      <div className="flex flex-row flex-wrap">
        {links.map((link) => {
          return (
            <a
              className="pr-6 text-blue-500 hover:text-blue-600"
              href={link.url}
              key={link.url}
            >
              {link.title}
            </a>
          );
        })}
      </div>
      <div>
        <p className="text-2xl py-4">Edit</p>
        <p>
          Editing the CRUD should be possible using the same form, if you have a
          correct admin secret (should also be stored locally)
        </p>
        <input
          className="p-2 mt-4 rounded-sm bg-transparent"
          placeholder="Admin Secret"
        />
      </div>
    </div>
  );
}
