function ApplePushNotifier (config) {
  const apn = require('apn')
  const providers = []
  const util = require('./util')
  const state = []
  const self = this
  const complete = function (channel, key, action) {
    state[action] = state[action] || 0
    state[action]++
    util.completed(channel, key, action)
  }

  this._channel = null

  for (var application in config) {
    if (config.hasOwnProperty(application)) {
      const providerConfiguration = JSON.parse(JSON.stringify(config[application]))
      providers[application] = new apn.Provider(providerConfiguration)
    }
  }

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
    const messageBusChannel = dependencies['message-bus']
    messageBusChannel.subscribe('*.*._notifier_apple.*.inserted', consumer, 'notifier_apple')
    self._channel = messageBusChannel
  }

  var consumer = function (routingKey, msg, cb) {
    if (routingKey === null) {
      // do nothing
      cb()
    }

    const data = msg || {}
    const key = routingKey.split('.').slice(1, 4).join('.')
    const payload = data.payload && typeof data.payload === 'object' ? data.payload : {}
    const recipients = util.fetchRecipients(data)
    const provider = util.isString(data.application) && providers[application] ? providers[data.application] : null

    if (recipients.length === 0 || provider === null) {
      complete(self._channel, key, 'skipped')
      cb()
    }

    var notification = new apn.Notification()
    notification.expiry = data.expiry || Math.floor(Date.now() / 1000) + (8 * 3600)
    notification.badge = data.badge || null
    notification.alert = util.isString(data.message) ? data.message : null
    notification.payload = payload
    provider.send(notification, recipients).then(function (response) {
      complete(self._channel, key, 'pushed', response)
    })
  }
}

module.exports.ApplePushNotifier = ApplePushNotifier
