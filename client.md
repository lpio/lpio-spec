## Creating a client.

Client options [schema](./schemas/client-options.json).

Client implements:

- `connect` first time connect, should be done only once
- `disconnect` stop reconnecting and sending messages
- `send` schedule a message

Client events:

- `connected` emitted once client has changed its connection state to connected
- `disconnected` emitted once client has changed its connection state to disconnected
- `error` emitted on every error, recoverable or not
- `message` emitted on every message of any type
- `data` emitted on messages of type "data" when data is not empty
