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
1. If client sends a message of type other than "ack" - it expects to receive an "ack" message.
1. Client always sends an "ack" message in response when it receives messages of type other than "ack".
1. Message of type "ack" has id which corresponds the original message id.
1. Client expects to get an "ack" message within a time span defined by `ackTimeout`. If it doesn't - message is considered undelivered.
1. Client waits for a response, until it gets one - request remains open.
1. Client aborts currently waiting request to send new messages.
1. After a successfully finished request client creates another one with new messages.
1. After a failed request client resends a request using a backoff logic ([backoff options](./schemas/client-backoff-options.json)). A reference implementation is [backoff](https://github.com/segmentio/backo).
1. Client is disconnected when backoff duration reached the `max` value.
1. Client is connected when a request was successfull.
1. Client accumulates messages to reduce amount of requests ([multiplexer options](./schemas/multiplexer-options.json))
1. Client issues a timeout error if no message has been received within time span defined by `responseTimeout`. Client will close current request and create a new one with backoff.

### Server

1. Server listens for XHR POST requests with JSON encoded [body](./schemas/client-request-body.json).
1. Server doesn't respond if it has no new messages.
1. Server always sends an "ack" message in response to any message type other than "ack".
1. Server sends a json encoded body defined by this [schema](./schemas/server-response.body.json)
1. Server accumulates messages to reduce amount of responses ([multiplexer options](./schemas/multiplexer-options.json))
1. Message is a json defined by this [schema](./schemas/message.json)
1. State codes are:
    - 0: "RECONNECT" - request is closed because a new one from the same client has been received.
    - 1: "NEW_MESSAGES" - new messages are included in the response.
    - 2: "ERROR" - an error happened.
    - 3: "SERVER_DESTROYED" - server has been destroyed.
    - 4: "CLIENT_ABORT" - client or something in between aborted the request. Client won't get it, but you may want to log it within "close" listener.
1. The knowledge about connected/disconnected users is not a part of LPIO server.
1. There is no separate handshake requests, every request is signed.
