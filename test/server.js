var assert = require('assert')
var superagent = require('superagent')

function request(body, callback) {
  return superagent
    .post('http://localhost:3000/lpio')
    .send(body)
    .set('Accept', 'application/json')
    .end(callback)
}

describe('Request/response validation', function() {
  it('should result in error when message has bad client id', function(done) {
    var body = {
      user: 'a',
      messages: []
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad "client" param.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when message has bad user id', function(done) {
    var body = {
      client: 'a',
      messages: []
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad "user" param.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when message has bad user id', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        type: 'data',
        sender: 'a',
        client: 'aa',
        recipient: 'b',
        data: 'something'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message id.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when message has bad type', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'wrong',
        sender: 'a',
        client: 'aa',
        recipient: 'b'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message type.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when message has bad sender', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'data',
        client: 'aa',
        recipient: 'b',
        data: 'something'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message sender.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when message has bad client', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'data',
        sender: 'a',
        recipient: 'b',
        data: 'something'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message client.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when ack message has bad recipient', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'ack',
        sender: 'a',
        client: 'aa',
        recipient: 'wrong'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad ack message recipient.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when data message has bad recipient', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'data',
        sender: 'a',
        client: 'aa',
        data: 'something'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message recipient.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when data message has no data', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'data',
        sender: 'a',
        client: 'aa',
        recipient: 'b'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message data.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when data message received bad ack', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'data',
        sender: 'a',
        client: 'aa',
        recipient: 'b',
        data: 'something'
      }]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 1, 'wrong state')
      var msg = res.body.messages[0]
      assert.equal(msg.id, '1', 'bad ack id')
      assert.equal(msg.type, 'ack', 'bad ack type')
      assert.equal(msg.sender, 'server', 'bad ack sender')
      assert.equal(typeof msg.client, 'string', 'bad ack client')
      assert.equal(msg.recipient, body.user, 'bad ack recipient')
      done()
    })
  })

  it('should not answer to ack messages', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: '1',
        type: 'ack',
        sender: 'a',
        client: 'aa',
        recipient: 'server'
      }]
    }
    var req = request(body, function(err, res) {
      assert(false, 'no response')
      done()
    })
    setTimeout(function() {
      req.abort()
      done()
    }, 1000)

  })
})

describe('Long polling', function() {
  it('should not respond for a long', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: []
    }
    var req = request(body, function(err, res) {
      assert(false, 'no response')
      done()
    })
    setTimeout(function() {
      req.abort()
      done()
    }, 1000)
  })
})

describe('When new request comes from the same client', function() {
  it('should close the current one', function(done) {
    var body = {
      user: 'a',
      client: 'aa',
      messages: []
    }
    var secondReq

    request(body, function(err, res) {
      assert.equal(res.body.state, 0, 'wrong state')
      secondReq.abort()
      done()
    })
    setTimeout(function() {
      secondReq = request(body, function() {})
    }, 100)
  })
})

describe('Dialog between user a and b', function() {
  var question = {
    type: 'data',
    id: '1',
    sender: 'a',
    client: 'aa',
    recipient: 'b',
    data: 'question'
  }

  var answer = {
    type: 'data',
    id: '2',
    sender: 'b',
    client: 'bb',
    recipient: 'a',
    data: 'answer'
  }

  it('a should send the question and get an ack from server', function(done) {
    var questionBody = {
      user: 'a',
      client: 'aa',
      messages: [question]
    }
    request(questionBody, function(err, res) {
      var messages = res.body.messages
      assert.equal(res.body.state, 1, 'bad state')
      assert.equal(messages[0].type, 'ack', 'bad question ack type')
      assert.equal(messages[0].id, question.id, 'bad question ack id')
      done()
    })
  })

  it('b should receive the question', function(done) {
    var pollBody = {
      user: 'b',
      client: 'bb',
      messages: []
    }
    request(pollBody, function(err, res) {
      assert.equal(res.body.state, 1, 'bad state')
      assert.deepEqual(res.body.messages[0], question, 'bad question')
      done()
    })
  })

  it('b should send the answer, ack the question and receive the ack for the answer from the server', function(done) {
    var questionAck = {
      id: question.id,
      type: 'ack',
      sender: 'b',
      client: 'bb',
      recipient: 'server'
    }
    var answerBody = {
      user: 'b',
      client: 'bb',
      messages: [answer, questionAck]
    }
    request(answerBody, function(err, res) {
      var messages = res.body.messages
      assert.equal(res.body.state, 1, 'bad state')
      assert.equal(messages[0].type, 'ack', 'bad answer ack type')
      assert.equal(messages[0].id, answer.id, 'bad answer ack id')
      done()
    })
  })

  it('a should receive the answer', function(done) {
    var pollBody = {
      user: 'a',
      client: 'aa',
      messages: []
    }
    request(pollBody, function(err, res) {
      assert.equal(res.body.state, 1, 'bad state')
      assert.deepEqual(res.body.messages[0], answer, 'bad answer')
      done()
    })
  })

  it('a should ack the answer and should not get any response', function(done) {
    var ackBody = {
      user: 'a',
      client: 'aa',
      messages: [{
        id: answer.id,
        type: 'ack',
        sender: 'a',
        client: 'aa',
        recipient: 'server'
      }]
    }

    var req = request(ackBody, function(err, res) {
      assert.ok(false, 'no response expected')
    })

    setTimeout(function() {
      req.abort()
      done()
    }, 1000)
  })

  it('b should not get any response', function(done) {
    var pollBody = {
      user: 'b',
      client: 'bb',
      messages: []
    }
    var req = request(pollBody, function(err, res) {
      assert.ok(false, 'no response expected')
    })

    setTimeout(function() {
      req.abort()
      done()
    }, 1000)
  })
})
