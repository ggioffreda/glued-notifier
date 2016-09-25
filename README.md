GluedJS - Notifier
==================

GlueJS micro service for sending notification through Firebase Cloud Messaging
and Apple Push Notification Service.

To send a push notification you need to send a message to the store and the 
processor will automatically detect a new one arrived and will deliver it to the 
recipients. Once delivered, the message in the store will be updated with the
delivery status and timestamp of when it's been processed.

To send your messages to the store you can use the 
[HTTP API](https://github.com/ggioffreda/glued-store#http-api) or the
[AMQP message bus](https://github.com/ggioffreda/glued-store#amqp-api).

Firebase Cloud Messaging
------------------------

### Configuration

To send messages through the FCM service you need to configure the providers,
fortunately this is really easy, see the example below:

```json
{
  "my_app_1": {
    "key": "YyQNkQyud8TKPannjhqp7sYLxlCdSp9xZDtsrds3",
    "production": true
  },
  "my_app_2": {
    "key": "u6G4XwScP8m6blbUYRsz05sOPvqPyLoCD8DTMcVb",
    "production": false
  }
}
```

Each property of the configuration object is a unique ID that you'll be using to
target the correct app when sending your messages. In each message you'll have to 
specify an *application* parameter, that points to the IDs in your configuration 
object. See the next section to have an idea how a message looks like.

Assuming you saved the configuration in `/etc/glued/fcm.json` you can then start
your notifier micro service like so:

    $ GLUED_NOTIFIER_FIREBASE_CONFIG=/etc/glued/fcm.json glue-notifier-firebase

Or you can set the **GLUED_NOTIFIER_FIREBASE_CONFIG** environment variable however
you like.

### Message

An FCM message is a simple object composed of:

- **recipient** (required, if *recipients* is not provided): the device token of 
  the recipient device;

- **recipients** (required, if *recipient* is not provided): an array of device
  tokens of the recipient devices;

- **message** (optional): the content of the push notification;

- **application** (required): the ID of the application you are sending the 
  notification to, this must match one in the configuration file (see above).

- **payload** (optional): additional payload that will be send together with the 
  message;

- **title** (optional): a title for the notification.

An example of a well formed message is:

```json
{
  "recipient":"APA91bF6dg7okdgKFEHcjeC1CTKN77XLVSauxCF1DL",
  "message":"You've received a new message, check your inbox!",
  "application":"my_app_1"
}
```

Apple Push Notification Service
-------------------------------

### Configuration

The configuration for the APN service requires a bit more parameters than FCM, but
follows the same principles. You can wrap all your applications in an object where
each property is a unique key and the value is the APN configuration that will be 
used to initialise each provider.

To see a full list of options refer to the
[node-apn documentation](https://github.com/argon/node-apn).

Example:

```json
{
  "my_app_1": {
    "token": {
      "key": "path/to/key1.p8",
      "keyId": "T0K3NK3Y1D1",
      "teamId": "T34M1D1",
    },
    "production": true,
  },
  "my_app_2": {
    "token": {
      "key": "path/to/key2.p8",
      "keyId": "T0K3NK3Y1D2",
      "teamId": "T34M1D2",
    },
    "production": false,
  }
}
```

Assuming you saved the configuration in `/etc/glued/apn.json` you can then start
your notifier micro service like so:

    $ GLUED_NOTIFIER_APPLE_CONFIG=/etc/glued/apn.json glue-notifier-apple

Or you can set the **GLUED_NOTIFIER_APPLE_CONFIG** environment variable however
you like.

### Message

A message is composed of:

- **recipient** (required, if *recipients* is not provided): the device token of 
  the recipient device;

- **recipients** (required, if *recipient* is not provided): an array of device
  tokens of the recipient devices;

- **message** (optional): the content of the push notification;

- **application** (required): the ID of the application you are sending the 
  notification to, this must match one in the configuration file (see above).

- **payload** (optional): additional payload that will be send together with the 
  message;

- **expiry** (optional): the timestamp when the notification expires, defaults to
  8 hours after the sending;

- **badge** (optional): a number to show as a badge on the target device.

Example:

```json
{
  "recipient":"a9d0ed10e9cfd022a61cb08753f49c5a0b0dfb383697bf9f9d750a1003da19c7",
  "message":"You've received a new message, check your inbox!",
  "application":"my_app_1"
}
```

Installation
------------

You can install this library using `npm`:

    $ npm install --save glued-notifier

To run the server you can install it with the `-g` flag and then run the
`glued-notifier-firebase` and `glued-notifier-apple` commands:

    $ npm install -g glued-notifier
    $ GLUED_NOTIFIER_FIREBASE_CONFIG=/etc/glued/fcm.json glue-notifier-firebase
    $ GLUED_NOTIFIER_APPLE_CONFIG=/etc/glued/apn.json glue-notifier-apple
