const version = require('./lib/version');
const OS = require('os');
const ganache = require('ganache-cli');

console.log(`DAV CLI v${version} - makes developing with DAV easy`+OS.EOL);

const server = ganache.server();
const port = 8545;
server.listen(port, (/*err, blockchain*/) => {
  console.log(`Local Ethereum node running. Listening on port ${port}.`);
});
