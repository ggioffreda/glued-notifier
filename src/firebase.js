function FirebaseCloudMessagingNotifier(config) {
  const fcm = require('node-gcm'),
    senders = [],
    util = require('./util'),
    state = [],
    complete = function (channel, key, action) {
      state[action] = state[action] || 0;
      state[action]++;
      util.completed(channel, key, action);
    };

  this._channel = null;

  for (var application in config) {
    if (config.hasOwnProperty(application)) {
      const senderConfiguration = JSON.parse(JSON.stringify(config[application]));
      senders[application] = new fcm.Sender(senderConfiguration.key);
    }
  }

  this.getName = function () {
    return 'notifier-firebase';
  };

  this.getState = function () {
    return { completed: state };
  };

  this.requires = function (dependency) {
    return 'message-bus' === dependency;
  };

  this.setUp = function (dependencies) {
    const messageBusChannel = dependencies['message-bus'];
    messageBusChannel.subscribe('*.*._fcm.*.inserted', consumer, 'glued_notifier_firebase');
    this._channel = messageBusChannel;
  }.bind(this);

  var consumer = function (routingKey, msg, cb) {
    const data = JSON.parse(msg.toString()) || {},
      key = routingKey.split('.').slice(1,4).join('.'),
      payload = data.payload && 'object' === typeof data.payload ? data.payload : {},
      recipients = util.fetchRecipients(data),
      sender = util.isString(data.application) && senders[application] ? senders[data.application] : null;

    if (0 === recipients.length || null === sender) {
      complete(this._channel, key, 'skipped');
      cb();
    }

    var notification = new fcm.Message({
      data: payload,
      notification: {
        title: util.isString(data.title) ? data.title : null,
        icon: util.isString(data.icon) ? data.icon : null,
        body: util.isString(data.message) ? data.message : null
      }
    });

    sender.send(notification, { registrationTokens: recipients }, function (error, response) {
      if (error) {
        complete(this._channel, key, 'errored', { error: error, response: response });
        cb();
      } else {
        complete(this._channel, key, 'pushed', { error: error, response: response });
        cb();
      }
    }.bind(this));
  }.bind(this);
}

module.exports.FirebaseCloudMessagingNotifier = FirebaseCloudMessagingNotifier;
