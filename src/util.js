var isString = function (value) {
  return value && Object.prototype.toString.call(value) === '[object String]';
};

var fetchRecipients = function (data) {
  var recipients = [];
  if (isString(data.recipient)) {
    recipients.push(data.recipient);
  }
  if (data.recipients && Object.prototype.toString.call(value) === '[object Array]') {
    for (var recipient in data.recipients) {
      if (isString(recipient)) {
        recipients.push(recipient);
      }
    }
  }
  return recipients;
};

var completed = function (channel, notification, action, info) {
  info = info || {};
  channel.publish([ 'glued_notifier', notification, action ].join('.'), info);
  channel.publish([ 'glued_notifier', notification, 'patch.store' ].join('.'), {
    items: [{
      action: 'update',
      patch: {
        _delivery_status: {
          updated_at: Date.now(),
          status: action,
          info: info
        }
      }
    }]
  });
};

module.exports.isString = isString;
module.exports.fetchRecipients = fetchRecipients;
module.exports.completed = completed;
