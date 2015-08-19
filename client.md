## Creating a client.

Options:

```json
{
  "title": "Client options schema",
  "type": "object",
  "properties": {
    "uri": {
      "type": "string",
      "required": true,
      "description": "uri or path to connect to"
    },
    "disconnectedAfter": {
      "type": "number",
      "required": false,
      "dafault": 5,
      "description": "number of attempts until 'discconnected' event can be emitted"
    },
    "multiplex": "See multiplexer.md options schema.",
    "backoff": "See backoff options schema."
  }
}
```

Client should be emitter.

Client implements:

- `connect` first time connect, should be done only once
- `disconnect` abort connection, stop reconnecting
- `open` opens the request, sends/receives data
- `send` schedules data
- `reopen` calls `open` using backoff

## Opening a connection.

- Ensure to open only one connection at time.
- Ensure to use a backoff technic described below.
- Use one request for sending and getting data.

## Creating request.

- Request headers
```
    Accept: application/json
    Content-Type: application/json;charset=UTF-8
```
- Method - `POST`
- JSON Body
    - `client` - a string that definitely identifies the client. Required!
    - `messages` - an array of messages client needs to send to the server, empty array by default.

## A message.

- Every time you want to send a message to the server, you just add it to multiplexer.
- Ever time multiplexer emits a `messages` event - you send all messages, passed along this event.
- User can be notified when message is delivered. For this an `ack` message needs to be subscribed and received.

User messages are of type `user` and can contain any data defined by user.

```json
{
  "title": "User message",
  "type": "obejct",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["user", "ack"],
      "required": true,
      "description": "message type"
    },
    "id": {
      "type": "string",
      "required": true,
      "description": "unique message id"
    },
    "body": {
      "type": "instance",
      "required": false,
      "description": "any kind of data"
    }
  }
}
```

## Acknowledgments.

Is an `ack` type of messages used to ensure stable messages delivering. This is the only way how we can ensure that a message has been really delivered.


## Handling errors.

We need to be aware that connection can be closed due to lots of different reasons: broken internet connection, server death or some transportation issues in between.

Client should handle any connection errors the same way:

- Add unsent user and ack messages back to multiplexer.
- Reopen connection.

## Reconnection backoff.

Every time we try to open a connection it might fail. To avoid high server and client load we need to implement incremental or even exponential backoff. Which means that we increase the time we wait until we try to reconnect again every time we fail in a row. After a successfull connection `reconnects` value gets resetted.

A reference implementation is [backoff](https://github.com/mokesmokes/backo2).

Options:

```json
{
  "type": "object",
  "required": false,
  "properties": {
    "min": {
      "type": "number",
      "required": false,
      "default": 100,
      "description": "minimal delay until next request"
    },
    "max": {
      "type": "number",
      "required": false,
      "default": 10000,
      "description": "maximal delay until next request"
    },
    "factor": {
      "type": "number",
      "required": false,
      "default": 2,
      "description": "factor considered for backoff calculation"
    }
  }
}
```

Example:

```js
ms = min * Math.pow(factor, attempts)
ms = Math.min(ms, max)
```

## Handling received messages.

- Create an ack message for every received user message and add it to multiplexer.
- Emit a `message` event for every user message and pass the message as an argument.
- If there are messages of type `ack`, callbacks waiting for those acks need to be called.

## Connected and disconnected.

Client should emit `connected` and `disconnected` events. Due to the nature of polling approach, closed connection doesn't mean disconnection.

Client should emit `disconnected` only after `disconnectedAfter` amount of failed attempts is reached.

Also client should NOT emit `disconnected` if it is not connected and it should NOT emit `connected` if it is already connected.
