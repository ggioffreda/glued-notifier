function ApplePushNotifier(config) {
  const apn = require('apn'),
    providers = [],
    util = require('./util');

  this._channel = null;

  for (var application in config) {
    if (config.hasOwnProperty(application)) {
      const providerConfiguration = JSON.parse(JSON.stringify(config[application]));
      providers[application] = new apn.Provider(providerConfiguration);
    }
  }

  this.requires = function (dependency) {
    return 'message-bus' === dependency;
  };

  this.setUp = function (dependencies) {
    const messageBusChannel = dependencies['message-bus'];
    messageBusChannel.subscribe('*.*._apn.*.inserted', consumer, 'glued_notifier_apple');
    this._channel = messageBusChannel;
  }.bind(this);

  var consumer = function (routingKey, msg, cb) {
    const data = JSON.parse(msg.toString()) || {},
      key = routingKey.split('.').slice(1,4).join('.'),
      payload = data.payload && 'object' === typeof data.payload ? data.payload : {},
      recipients = util.fetchRecipients(data),
      provider = util.isString(data.application) && providers[application] ? providers[data.application] : null;

    if (0 === recipients.length || null === sender) {
      util.completed(this._channel, key, 'skipped');
      cb();
    }

    var notification = new apn.Notification();
    notification.expiry = data.expiry || Math.floor(Date.now() / 1000) + (8 * 3600);
    notification.badge = data.badge || null;
    notification.alert = util.isString(data.message) ? data.message : null;
    notification.payload = payload;
    provider.send(notification, recipients).then(function (response) {
      util.completed(this._channel, key, 'pushed', response);
    }.bind(this));
  }.bind(this);
}

module.exports.ApplePushNotifier = ApplePushNotifier;
