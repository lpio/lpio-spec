## Multiplexing.

Multiplexing is needed to lower the load on the client and server by reducing the amount of requests. Multiplexer as layer where messages are accumulated and dispatched periodically.

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
- `add` add a message.
- `get` get all `messages`.
- `reset` forget all messages.

Multiplexer will periodically automatically:
- reset messages store
- emit `drain` event with messages as an argument, when `duration` is over and there are messages to be send.