const program = require('commander');
const version = require('./lib/version');
const OS = require('os');
const ganache = require('ganache-cli');

// Configure the CLI
program
  .version(version)
  .description('makes developing with DAV easy')
  .option('--start', 'Start a local Ethereum node')
  .parse(process.argv);

console.log(`DAV CLI v${version} - makes developing with DAV easy`+OS.EOL);

// Start a local Ethereum server
const port = 8545;
if (program.start) {
  const server = ganache.server();
  server.listen(port, (/*err, blockchain*/) => {
    console.log(`Local Ethereum node running. Listening on port ${port}.`);
  });
}
