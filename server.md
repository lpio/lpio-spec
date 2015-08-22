## Creating a server.

Server options [schema](./schemas/server-options.json).

Server should be emitter.

Server implements:

- `open` is called after an incomming http request with a valid session, subscribes for new messages for the user.
- `close` closes open connection to the passed client id or all open connections.
- `destroy` closes all open connections, destroys listeners, destroys adapter.
- `save` saves a message for one or many recipients.

## Handling incomming request.

Request can be accepted from any URI used by the client. Incomming `POST` request has always a json encoded body.

Request handler calls `open` method which accepts params with [schema](./schemas/server-request-open-params.json)

Method `open` will:
- send new messages
- get new messages from adapter, add them to multiplexer
- listen to adapter for new messages, add them to multiplexer
- listen to `drain` event from multiplexer, send messages to the client and destroy connection.


