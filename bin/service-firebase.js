#!/usr/bin/env node

const ServiceManager = require('glued-common').ServiceManager,
  manager = new ServiceManager(),
  FirebaseCloudMessagingNotifier = require('../src/firebase').FirebaseCloudMessagingNotifier;

if (!process.env.GLUED_NOTIFIER_FIREBASE_CONFIG) {
  console.error('You must provide the path to the FCM configuration file');
}

const config = require(process.env.GLUED_NOTIFIER_FIREBASE_CONFIG);

manager.load(new FirebaseCloudMessagingNotifier(config));
