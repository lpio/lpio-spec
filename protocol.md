## LPIO Protocol.

LPIO is designed for scalable stateless architecture.

### Client

1. There is just one transport - HTTP Long Polling.
1. Client sends an XHR POST request with JSON encoded [body](./schemas/client-request-body.json) and headers:
    ```
    Accept: application/json
    Content-Type: application/json;charset=UTF-8
    ```
1. If client sent messages of type other than"ack", it expects to receive an "ack" message for every corresponding message.
1. Message of type "ack" has id which corresponds the original message id.
1. Client expects to get an "ack" message in respond within a timespan defined by `ackTimeout`. If it doesn't - message is considered as undelivered.
1. Client waits for a response, until it gets one - request remains open.
1. Client aborts currently waiting request to send new messages.
1. After a successfully finished request client creates another one.
1. After a failed request client reconnects using a backoff logic ([backoff options](./schemas/client-backoff-options.json)). A reference implementation is [backoff](https://github.com/segmentio/backo).
1. Client is disconnected when amount of failed requests is bigger than `disconnectedAfter` option.
1. Client is connected when a request was successfull.
1. Client sends ping request if no message has been received within `pingInterval` option.
1. Client sends client id, user id and messages.
1. Message is a json defined by this [schema](./schemas/message.json)
1. Client always sends an "ack" message in response.
1. Client accumulates messages to reduce amount of requests ([multiplexer options](./schemas/multiplexer-options.json))

### Server

1. Server listens for XHR POST requests with JSON encoded [body](./schemas/client-request-body.json).
1. Server doesn't respond if it has no new messages.
1. Server always sends an "ack" message in response to any message type except of "ack".
1. Server sends a json encoded body defined by this [schema](./schemas/server-response.body.json)
1. Server accumulates messages to reduce amount of requests ([multiplexer options](./schemas/multiplexer-options.json))
1. Message is a json defined by this [schema](./schemas/message.json)
1. The knowledge about connected/disconnected users is not part of LPIO server.
1. There is noseparate handshake requests, every request has client and user id's.