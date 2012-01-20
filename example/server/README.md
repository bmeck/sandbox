# Sandbox Server

In this example, we present a server than can accept Javascript from a post request.
The data (non-url-encoded) will be executed as a script and return the result as JSON.

## Running

The PORT environmental variable will be honored.

```bash
PORT=8080 node server.js
```

## Use Cases

1. Allowing users of a rest API to automate actions via something like triggers.
2. Provide an internal API that is non-trivial to communicate with (stateful APIs)
3. Many more...
