var assert = require('assert')
var superagent = require('superagent')

function request(body, callback) {
  return superagent
    .post('http://localhost:3000/lpio')
    .send(body)
    .set('Accept', 'application/json')
    .end(callback)
}

describe('Ping message', function() {
  it('should get an ack', function(done) {
    var ping = {
      type: 'ping',
      id: '1',
      sender: 'a',
      client: 'aa'
    }
    var body = {
      user: 'a',
      client: 'aa',
      messages: [ping]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 1, 'wrong state')
      var ack = res.body.messages[0]
      assert.equal(ack.type, 'ack', 'wrong message type')
      assert.equal(ack.id, ping.id, 'bad message id')
      assert.equal(typeof ack.client, 'string', 'bad server id')
      assert.equal(ack.recipient, ping.sender, 'bad recipient')
      assert.equal(ack.sender, 'server', 'bad sender')
      done()
    })
  })
})

describe('Data message', function() {
  it('should get an ack', function(done) {
    var data = {
      type: 'data',
      id: '1',
      sender: 'a',
      client: 'aa'
    }
    var body = {
      user: 'a',
      client: 'aa',
      messages: [data]
    }
    request(body, function(err, res) {
      assert.equal(res.body.state, 1, 'wrong state')
      var ack = res.body.messages[0]
      assert.equal(ack.type, 'ack', 'wrong message type')
      assert.equal(ack.id, data.id, 'bad message id')
      assert.equal(typeof ack.client, 'string', 'bad server id')
      assert.equal(ack.recipient, data.sender, 'bad recipient')
      assert.equal(ack.sender, 'server', 'bad sender')
      done()
    })
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
      user: 'b',
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
        user: 'a',
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
