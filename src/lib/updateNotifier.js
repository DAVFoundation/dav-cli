const updateNotifier = require('update-notifier');
const pkg = require('../../package.json');

const notifier = updateNotifier({
  pkg,
  updateCheckInterval: 0
});
notifier.notify();
