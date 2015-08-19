## Creating a server.

Options

```json
{
  "title": "Server options",
  "properties": {
    "ackTimeout": {
      "type": "number",
      "default": 40000,
      "description": "amount of ms to wait until message becomes undelivered"
    },
    "keepAlive": {
      "type" "number",
      "default": 25000,
      "description": "amount of ms server should keep a connection open"
    },
    "disconnectedAfter": {
      "type": "number",
      "default": 40000,
      "description": "amount of ms until client becomes disconnected if no connection happened during this period"
    },
    "multiplex": "See multiplexer.md options schema.",
  }
}
```

Server should be emitter.

Client should implement: