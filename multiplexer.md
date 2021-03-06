## Multiplexing.

Multiplexing is needed to lower the load on the client and server by reducing the amount of requests. Multiplexer is a layer where messages are accumulated and dispatched periodically. Client and server should add messages to multiplexer instead of directly sending messages. When multiplexer emitts "drain", messages can be sent.

Options [schema](./schemas/multiplexer-options.json).

Multiplexer implements:
- `add` add a message.
- `get` get all `messages`.
- `reset` forget all messages.
- `destroy` stop periodical emiting, remove listeners.

Multiplexer will periodically:
- empty messages store
- emit `drain` event with messages as an argument, when `duration` is over and there are messages to be send.