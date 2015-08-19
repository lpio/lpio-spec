# Natural language specification.

LPIO is using http long polling technic to achieve bidirectional communication between server and client. Http polling has some advantages against websockets and co. and is still the best choice for chat-like applications.

Advantages:
- Some companies have firewalls that will prevent WebSockets from working.
- If you are deploying software in a shared hosting environment, you may not be permitted to use WebSockets.
- If you are behind a reverse proxy that isn’t configured or the software doesn’t support pass-through of WebSocket protocol, WebSockets won’t work.

Consider also:
- WebSockets loose their advantage when client has a weak internet connection and reconnects often.
- [Keepalive](https://en.wikipedia.org/wiki/Keepalive) allows us to have a persistent connection on the TCP level.
- Upgrade or downgrade to websockets or any other transports is error proven.

## Client

### Opening a connection.

- Ensure to open only one connection at time.
- Ensure to use a backoff technic described below.
- Use one request for sending and getting data.

### Creating request.

- Request headers
```
    Accept: application/json
    Content-Type: application/json;charset=UTF-8
```
- Method - `POST
- JSON Body
    - `client` - a string that definitely identifies the client. Required!
    - `messages` - an array of messages client needs to send to the server, empty array by default.

### User messages.

- Every time you want to send a message to the server, you just add it to multiplexer.
- Ever time multiplexer emits a 'messages' event - you send all messages.
- User can be notified when message is delivered. For this an 'ack' message needs to be subscribed and received.

User messages are of type `user` and can contain any data defined by user.

```json
{
  type: 'user',
  id: 'unique message id',
  body: {anything}
}
```

### Acknowledgments.

To ensure stable messages delivering we send confirmations to the sender. This is the only way how we can ensure that a message has been really delivered.

Acknowledgement messages are message objects of type `ack`.

```json
{
  type: 'ack',
  id: 'unique message id'
}
```

### Multiplexing.

Multiplexing is needed to lower the load on the client and server by reducing the amount of requests. Multiplexer as layer where messages are accumulated.

Default multiplex `duration` is `500ms`. This should be a customizable option.

Multiplexer implements:
- `add` a message.
- `get` all `messages`.
- `reset` when you want it to forget all messages.

Multiplexer will periodically:
- reset messages store
- emit `messages` event with messages as an argument, when `duration` is over and there are messages to be send.

### Handling errors.

We need to be aware that connection can be closed due to lots of different reasons: broken internet connection, server death or some transportation issues in between.

Client should handle any connection errors the same way:

- Put unsent user and ack messages back to multiplexer.
- Reopen connection.

### Reconnection backoff.

Every time we try to open a connection it might fail. To avoid high server and client load we need to implement incremental or even exponential backoff. Which means that we increase the time we wait until we try to reconnect again every time we fail in a row. After a successfull connection `reconnects` value gets resetted.

A reference implementation is [backoff](https://github.com/mokesmokes/backo2).

Options a backoff needs to implement:
- `min` - minimal delay, 100 by default
- `max` - maximal delay, 10000 by default
- `factor` - factor which is used for calculation, 2 by default

Example:

```js
ms = min * Math.pow(factor, attempts)
ms = Math.min(ms, max)
```

### Handling received messages.

- Create an ack message for every user message and add it to multiplexer.
- Emit a `message` event for every user message and pass the message as an argument.
- If there are messages of type 'ack', callbacks waiting for those acks need to be called.

### Connected and disconnected.

Client should emit `connected` and `disconnected` events. Due to the nature of polling approach, closed connection doesn't mean disconnection.

Client needs to implement a `disconnectedAfter` option, `5` by default. Which means that only after 5 attemts to open a connection client will emit `disconnected`. Also client should NOT emit `disconnected` if it is not connected and it should NOT emit `connected` if it is already connected.

## Server