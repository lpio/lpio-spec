## Multiplexing.

Multiplexing is needed to lower the load on the client and server by reducing the amount of requests. Multiplexer as layer where messages are accumulated.

Options:

```json
{
  "id": "/multiplexer/options",
  "title": "Multiplexer options",
  "type": "object",
  "required": false,
  "properties": {
    "duration": {
      "type": "number",
      "default": 500,
      "required": false,
      "description": "multiplex duration in ms"
    }
  }
}
```

Multiplexer implements:
- `add` a message.
- `get` all `messages`.
- `reset` when you want it to forget all messages.

Multiplexer will periodically:
- reset messages store
- emit `messages` event with messages as an argument, when `duration` is over and there are messages to be send.