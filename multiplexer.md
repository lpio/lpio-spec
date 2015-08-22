## Multiplexing.

Multiplexing is needed to lower the load on the client and server by reducing the amount of requests. Multiplexer is a layer where messages are accumulated and dispatched periodically.

Options [schema](./schemas/multiplexer-options.json).

Multiplexer implements:
- `add` add a message.
- `get` get all `messages`.
- `reset` forget all messages.

Multiplexer will periodically:
- empty messages store
- emit `drain` event with messages as an argument, when `duration` is over and there are messages to be send.