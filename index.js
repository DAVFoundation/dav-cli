const program = require('commander');
const version = require('./lib/version');
const OS = require('os');
const ganache = require('ganache-cli');

// Configure the CLI
program
  .version(version)
  .option('--start', 'Start a local Ethereum node')
  .description(`DAV CLI v${version} - makes developing with DAV easy`)
  .option('-p, --port <n>', 'Port for Ethereum node to listen to')
  .parse(process.argv);

console.log(`DAV CLI v${version} - makes developing with DAV easy`+OS.EOL);

// Start a local Ethereum server
const port = program.port || 8545;
if (program.start || program.port) {
  const server = ganache.server();
  server.listen(port, (/*err, blockchain*/) => {
    console.log(`Local Ethereum node running. Listening on port ${port}.`);
  });
}
