## Creating a client.

- Client should be emitter.
- Client should accept options:

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
    "multiplex": {
      "type": "object",
      "required": false,
      "description": "multiplexer options",
      "properties": {
        "duration": {
          "type": "number",
          "required": false,
          "description": "multiplex duration in ms"
        }
      }
    },
    "backoff": {
      "type": "object",
      "required": false,
      "properties": {
        "min": {
          "type": "number",
          "required": false,
          "description": "minimal delay until next request"
        },
        "max": {
          "type": "number",
          "required": false,
          "description": "maximal delay until next request"
        },
        "factor": {
          "type": "number",
          "required": false,
          "description": "factor considered for backoff calculation"
        }
      }
    }
  }
}
```

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

## User messages.

- Every time you want to send a message to the server, you just add it to multiplexer.
- Ever time multiplexer emits a `messages event - you send all messages, passed along this event.
- User can be notified when message is delivered. For this an 'ack' message needs to be subscribed and received.

User messages are of type `user` and can contain any data defined by user.

```json
{
  "type": "user",
  "id": "{unique message id}",
  "body": {"anyData": true}
}
```

## Acknowledgments.

To ensure stable messages delivering we send confirmations to the sender. This is the only way how we can ensure that a message has been really delivered.

Acknowledgement messages are message objects of type `ack`.

```json
{
  "type": "ack",
  "id": "{unique message id}"
}
```

## Multiplexing.

Multiplexing is needed to lower the load on the client and server by reducing the amount of requests. Multiplexer as layer where messages are accumulated.

Default multiplex `duration` is `500ms`. This should be a customizable option.

Multiplexer implements:
- `add` a message.
- `get` all `messages`.
- `reset` when you want it to forget all messages.

Multiplexer will periodically:
- reset messages store
- emit `messages` event with messages as an argument, when `duration` is over and there are messages to be send.

## Handling errors.

We need to be aware that connection can be closed due to lots of different reasons: broken internet connection, server death or some transportation issues in between.

Client should handle any connection errors the same way:

- Add unsent user and ack messages back to multiplexer.
- Reopen connection.

## Reconnection backoff.

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

## Handling received messages.

- Create an ack message for every user message and add it to multiplexer.
- Emit a `message` event for every user message and pass the message as an argument.
- If there are messages of type 'ack', callbacks waiting for those acks need to be called.

## Connected and disconnected.

Client should emit `connected` and `disconnected` events. Due to the nature of polling approach, closed connection doesn't mean disconnection.

Client needs to implement a `disconnectedAfter` option, `5` by default. Which means that only after 5 failed in the row attemts to open a connection client will emit `disconnected`. Also client should NOT emit `disconnected` if it is not connected and it should NOT emit `connected` if it is already connected.
