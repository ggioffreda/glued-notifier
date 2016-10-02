#!/usr/bin/env node

const ServiceManager = require('glued-common').ServiceManager
const manager = new ServiceManager()
const ApplePushNotifier = require('../src/apple').ApplePushNotifier

if (!process.env.GLUED_NOTIFIER_APPLE_CONFIG) {
  console.error('You must provide the path to the APN configuration file')
}

const config = require(process.env.GLUED_NOTIFIER_APPLE_CONFIG)

manager.load(new ApplePushNotifier(config), require('../package.json'))
