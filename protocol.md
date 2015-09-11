## LPIO Protocol.

LPIO is designed for scalable stateless architecture.

### Client

1. There is just one transport - HTTP Long Polling.
1. Client sends an XHR POST request with JSON encoded [body](./schemas/client-request-body.json) and headers:

    ```
    Accept: application/json
    Content-Type: application/json;charset=UTF-8
    ```
1. Message is a json defined by this [schema](./schemas/message.json)
1. If client sends a message of type other than "ack" - it expects to receive an ["ack" message](./schemas/message-ack.json).
1. Client always sends an ["ack" message](./schemas/message-ack.json) in response when it receives messages of type other than "ack".
1. Client expects to get an ["ack" message](./schemas/message-ack.json) within a time span defined by `ackTimeout`. If it doesn't - message is considered undelivered.
1. Client waits for a response, until it gets one - request remains open.
1. Client aborts currently waiting request to send new messages.
1. After a successfully finished request client creates another one with new messages.
1. After a failed request client resends a request using a backoff logic ([backoff options](./schemas/client-backoff-options.json)). A reference implementation is [backoff](https://github.com/segmentio/backo).
1. Client accumulates messages to reduce amount of requests ([multiplexer options](./schemas/multiplexer-options.json))
1. Client issues a timeout error if no message has been received within time span defined by `responseTimeout`. Client will close current request and create a new one with backoff.
1. Client is disconnected when backoff duration reached the `max` value.
1. Client is connected when a request was successfull.
1. Client can have a static client id. If server wants to define the client id dynamically - it needs to respond with a [message of type "option"](./schemas/message-option.json).

### Server

1. Server listens for XHR POST requests with JSON encoded [body](./schemas/client-request-body.json).
1. Server doesn't respond if it has no new messages.
1. Server always sends an ["ack" message](./schemas/message-ack.json) in response to any message type other than "ack".
1. Server sends a json encoded body defined by this [schema](./schemas/server-response.body.json)
1. Server accumulates messages to reduce amount of responses ([multiplexer options](./schemas/multiplexer-options.json))
1. If request body doesn't contain `client` id, server should respond immediately with a [message of type "option"](./schemas/message-option.json) to define the client id.
1. Message is a json defined by this [schema](./schemas/message.json)
1. The knowledge about connected/disconnected users is not a part of LPIO server.
1. There is no separate handshake requests, every request is signed.
1. If user is unauthorized, server should respond with `403` http status code.
