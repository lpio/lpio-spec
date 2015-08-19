## Natural language specification.

LPIO is using http long polling technic to achieve bidirectional communication between server and client. Http polling has some advantages against websockets and co. and is still the best choice for chat-like applications.

Advantages:
- Some companies have firewalls that will prevent WebSockets from working.
- If you are deploying software in a shared hosting environment, you may not be permitted to use WebSockets.
- If you are behind a reverse proxy that isn’t configured or the software doesn’t support pass-through of WebSocket protocol, WebSockets won’t work.

Consider also:
- WebSockets loose their advantage when client has a weak internet connection and reconnects often.
- [Keepalive](https://en.wikipedia.org/wiki/Keepalive) allows us to have a persistent connection on the TCP level.
- Upgrade or downgrade to websockets or any other transports is error proven.

## Client

[Client spec](./client.md)

[Reference client implementation in javascript](https://github.com/lpio/client-js)

## Server

[Server spec](./server.md)

[Reference server implementation in node](https://github.com/lpio/server-node)
