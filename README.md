# ts_server

A very simple HTTP Server library written in TypeScript. It has support pre and post interceptors.

# Running

From the `example-server` folder

```bash
npm run start
```

**Output**

```bash
me@Awesome-Town example-server % npm run start

> example-server@0.0.1 start
> ts-node src/app/app.ts env:dev

2024-10-06T14:57:22.089Z - example-server initialized
2024-10-06T14:57:22.091Z - -=-=-=-=-=-=-=-=-=-=-=-=-=-=-
2024-10-06T14:57:22.091Z - Registered GET /example
2024-10-06T14:57:22.095Z - Listening on 8080 in DEV mode.
```

This will start a server on 8080 which you can access with [http://localhost:8080/example]

This will output:

```json
{
message: "Hello World!"
}
```