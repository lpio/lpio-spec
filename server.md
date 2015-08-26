## Creating a server.

Server options [schema](./schemas/server-options.json).

Server should be emitter.

Server implements:

- `open` is called after an incomming http request with a valid session, subscribes for new messages for the user.
- `close` closes request to the specified client or all clients.
- `destroy` ends all open requests, removes listeners, destroys adapter.
- `save` saves a message for one or many recipients.

## Handling incomming request.

Request can be accepted from any URI used by the client. Incomming `POST` request has always a json encoded body.

Ensure to maintain only one open request to the same client.

Request handler calls `open` method which accepts params with [schema](./schemas/server-request-open-params.json)

Method `open` will:
- save incomming messages.
- get new messages from adapter and add them to multiplexer.
- listen to adapter for new messages and add them to multiplexer.
- listen to `drain` event from multiplexer and end request.

## End request.

When end requests, always send messages accumulated by multiplexer.

## Destroy server.

- end all requests.
- remove all listeners
- destroy adapter

## Save a message.

Method `save` will use the adapter to save messages of type "user".




