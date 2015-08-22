## Creating a client.

Client options [schema](./schemas/client-options.json).

Client should be emitter.

Client implements:

- `connect` first time connect, should be done only once
- `disconnect` abort connection, stop reconnecting
- `open` opens the request, sends/receives data
- `send` schedules message to send, subscribes ack is callback is passed
- `reopen` calls `open` using a backoff stratagy

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
- JSON body [schema](./schemas/client-request-body.json)

## A message.

- Every time you want to send a message to the server, just add it to multiplexer.
- Every time multiplexer emits a `drain` event - send all messages, passed with this event.
- User can be notified when message is delivered. For this an `ack` message needs to be subscribed and received.


Message [schema](./schemas/message.json).


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

Backoff options [schema](./schemas/client-backoff-options.json)

Example:

```js
ms = min * Math.pow(factor, attempts)
ms = Math.min(ms, max)
```

## Handling received messages.

- Create an ack message for every received user message and add it to multiplexer.
- Emit a `message` event for every user message and pass the message as an argument.
- If there are messages of type `ack`, callbacks waiting for those acks need to be called.

## Emitting connected and disconnected.

Client should emit `connected` and `disconnected` events. Due to the nature of polling approach, closed connection doesn't mean disconnection.

Client should emit `disconnected` only after it tailed amount of times defined by  `disconnectedAfter`.

Client should only emit `disconnected` if it was connected before.

Client should only emit `connected` if it was disconnected before.