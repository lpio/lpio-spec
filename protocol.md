## LPIO Protocol.

### Client

1. There is just one transport - http long polling.
1. Client sends an XHR POST request with JSON encoded body.
1. Client waits for a response until it gets one, request remains open.
1. After a successfull request clients sends another one.
1. After a failed request client reconnects using backoff logic.
1. Client is disconnected when `disconnectedAfter` amount of requests failed.
1. Client is connected when a request was successfull.
1. Client sends ping request if no message has been received within `pingInterval`.
1. Client sends client id, user id and messages.
1. Message is a json defined by this [schema](./Message.json)
1. Client always sends an "ack" message in response.

### Server

1. Server listens for XHR POST requests with JSON encoded body.
1. Server doesn't respond to a request if it has no new messages.
1. Server always sends an "ack" message in response to any message type except of "ack".
1. Server sends a json encoded body defined by this [schema](./server-response.body.json)
