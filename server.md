## Creating a server.

Options

```json
{
  "id": "/server/options",
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
    "multiplex": {"$ref": "/multiplexer/options"},
  }
}
```

Server should be emitter.

Server should implement: