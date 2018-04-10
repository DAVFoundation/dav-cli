const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');
const config = require('../config');

const notifier = updateNotifier({
    pkg,
    updateCheckInterval: config('update_check_interval')
  });
  notifier.notify();