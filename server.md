## Creating a server.

Server options [schema](./schemas/server-options.json).

Server implements:

- `open` to be called when accepted an incomming http request with a valid client, returns an emitter.
- `close` closes request to the specified client.
- `destroy` closes all open requests, removes listeners, destroys adapter.
- `send` sends a message to a client using adapter

Events from emitter returned by `open`:

- `message` any kind of received message
- `data` only when received a message of type "data" if data is not empty
- `close` emitted when messages have to be sent, messages are the first argument
- `error` always handle errors


## Handling incomming request.

Request can be accepted from any URI used by the client. Incomming `POST` request has always a json encoded body.

Ensure to maintain only one open request to the same client.

Request handler calls `open` method which accepts params with [schema](./schemas/server-request-open-params.json)

Method `open` will:
- dispatch messages on adapter
- get new messages from adapter and add them to multiplexer
- listen on adapters emitter for new messages, add them to multiplexer
- listen to `drain` event from multiplexer and close request

## Destroy server.

- end all requests.
- remove all listeners
- destroy adapter


# Adapter.

Adapter is a class implementing a storage abstraction which can be used by the server to propagate events events between servers and make them persistent.




