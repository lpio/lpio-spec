var assert = require('assert')
var superagent = require('superagent')

function request(client, body, callback) {
  return superagent
    .set('LPIO-Client', client)
    .post('http://localhost:3000/lpio')
    .send(body)
    .set('Accept', 'application/json')
    .end(callback)
}

describe('Request/response validation', function() {
  it('should result in error when message has bad message id', function(done) {
    var body = {
      messages: [{
        type: 'data',
        channel: 'b',
        data: 'something'
      }]
    }
    request('a', body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message id.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when message has bad type', function(done) {
    var body = {
      messages: [{
        id: '1',
        type: 'wrong',
        channel: 'b'
      }]
    }
    request('a', body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message type.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when data message has bad channel', function(done) {
    var body = {
      messages: [{
        id: '1',
        type: 'data',
        data: 'something'
      }]
    }
    request('a', body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message channel.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when data message has bad data', function(done) {
    var body = {
      messages: [{
        id: '1',
        type: 'data',
        channel: 'b'
      }]
    }
    request('a', body, function(err, res) {
      assert.equal(res.body.state, 2, 'wrong state')
      assert.equal(res.body.error, 'Bad message data.', 'bad error message')
      assert.equal(res.body.messages.length, 0, 'bad messages')
      done()
    })
  })

  it('should result in error when data message received bad ack', function(done) {
    var body = {
      messages: [{
        id: '1',
        type: 'data',
        channel: 'b',
        data: 'something'
      }]
    }
    request('a', body, function(err, res) {
      assert.equal(res.body.state, 1, 'wrong state')
      var msg = res.body.messages[0]
      assert.equal(msg.id, '1', 'bad ack id')
      assert.equal(msg.type, 'ack', 'bad ack type')
      done()
    })
  })

  it('should not answer to ack messages', function(done) {
    var body = {
      messages: [{
        id: '1',
        type: 'ack'
      }]
    }
    var req = request('a', body, function(err, res) {
      assert(false, 'no response')
      done()
    })
    setTimeout(function() {
      req.abort()
      done()
    }, 1000)

  })
})

describe('Request without valid client id', function() {
  it('should respond with option message', function(done) {
    var body = {
      messages: []
    }
    request('', body, function(err, res) {
      assert.equal(res.body.state, 1, 'wrong state')
      assert.equal(res.body.messages.length, 1, 'just one message')
      var message = res.body.messages[0]
      assert.equal(message.type, 'option', 'bad message type')
      assert.equal(message.id, 'client', 'bad message id')
      assert.equal(typeof message.data, 'string', 'bad message data')
      done()
    })
  })
})

describe('Long polling', function() {
  it('should not respond for a long', function(done) {
    var body = {
      messages: []
    }
    var req = request('a', body, function(err, res) {
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
      messages: []
    }
    var secondReq

    request('a', body, function(err, res) {
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
    channel: 'b',
    data: 'question'
  }

  var answer = {
    type: 'data',
    id: '2',
    channel: 'b',
    data: 'answer'
  }

  it('a should send the question and get an ack from server', function(done) {
    var questionBody = {
      messages: [question]
    }
    request('a', questionBody, function(err, res) {
      var messages = res.body.messages
      assert.equal(res.body.state, 1, 'bad state')
      assert.equal(messages[0].type, 'ack', 'bad question ack type')
      assert.equal(messages[0].id, question.id, 'bad question ack id')
      done()
    })
  })

  it('b should receive the question', function(done) {
    var pollBody = {
      messages: []
    }
    request('b', pollBody, function(err, res) {
      assert.equal(res.body.state, 1, 'bad state')
      assert.deepEqual(res.body.messages[0], question, 'bad question')
      done()
    })
  })

  it('b should send the answer, ack the question and receive the ack for the answer from the server', function(done) {
    var questionAck = {
      id: question.id,
      type: 'ack'
    }
    var answerBody = {
      messages: [answer, questionAck]
    }
    request('b', answerBody, function(err, res) {
      var messages = res.body.messages
      assert.equal(res.body.state, 1, 'bad state')
      assert.equal(messages[0].type, 'ack', 'bad answer ack type')
      assert.equal(messages[0].id, answer.id, 'bad answer ack id')
      done()
    })
  })

  it('a should receive the answer', function(done) {
    var pollBody = {
      messages: []
    }
    request('a', pollBody, function(err, res) {
      assert.equal(res.body.state, 1, 'bad state')
      assert.deepEqual(res.body.messages[0], answer, 'bad answer')
      done()
    })
  })

  it('a should ack the answer and should not get any response', function(done) {
    var ackBody = {
      messages: [{
        id: answer.id,
        type: 'ack'
      }]
    }

    var req = request('a', ackBody, function(err, res) {
      assert.ok(false, 'no response expected')
    })

    setTimeout(function() {
      req.abort()
      done()
    }, 1000)
  })

  it('b should not get any response', function(done) {
    var pollBody = {
      messages: []
    }
    var req = request('b', pollBody, function(err, res) {
      assert.ok(false, 'no response expected')
    })

    setTimeout(function() {
      req.abort()
      done()
    }, 1000)
  })
})
