function FirebaseCloudMessagingNotifier (config) {
  const fcm = require('node-gcm')
  const senders = []
  const util = require('./util')
  const state = []
  const self = this
  const complete = function (channel, key, action) {
    state[action] = state[action] || 0
    state[action]++
    util.completed(channel, key, action)
  }

  this._channel = null

  this.getName = function () {
    return 'notifier-firebase'
  }

  this.getState = function () {
    return { completed: state }
  }

  this.requires = function (dependency) {
    return dependency === 'message-bus'
  }

  this.setUp = function (dependencies) {
    self._channel = dependencies['message-bus']

    for (var application in config) {
      if (config.hasOwnProperty(application)) {
        const senderConfiguration = JSON.parse(JSON.stringify(config[application]))
        senders[application] = new fcm.Sender(senderConfiguration.key)
      }
    }
    self._channel.subscribe('*.*._notifier_firebase.*.inserted', consumer, 'notifier_firebase')
  }

  var consumer = function (routingKey, msg, rawMsg, cb) {
    if (routingKey === null) {
      // do nothing
      cb()
    }

    const data = msg || {}
    const key = routingKey.split('.').slice(1, 4).join('.')
    const payload = data.payload && typeof data.payload === 'object' ? data.payload : {}
    const recipients = util.fetchRecipients(data)
    const sender = util.isString(data.application) && senders[data.application] ? senders[data.application] : null

    if (recipients.length === 0 || sender === null) {
      complete(self._channel, key, 'skipped')
      cb()
    }

    var notification = new fcm.Message({
      data: payload,
      notification: {
        title: util.isString(data.title) ? data.title : null,
        icon: util.isString(data.icon) ? data.icon : null,
        body: util.isString(data.message) ? data.message : null
      }
    })

    sender.send(notification, { registrationTokens: recipients }, function (error, response) {
      if (error) {
        complete(self._channel, key, 'errored', { error: error, response: response })
        cb()
      } else {
        complete(self._channel, key, 'pushed', { error: error, response: response })
        cb()
      }
    })
  }
}

module.exports.FirebaseCloudMessagingNotifier = FirebaseCloudMessagingNotifier
