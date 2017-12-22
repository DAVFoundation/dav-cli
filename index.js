const program = require('commander');
const version = require('./lib/version');
const OS = require('os');
const ganache = require('ganache-cli');

program.on('--help', () => {
  console.log();
  console.log('  Examples:');
  console.log();
  console.log('    - Start a local Ethereum node on the default port');
  console.log('      $ dav-cli --start');
  console.log();
  console.log('    - Start a local Ethereum node on port 1234');
  console.log('      $ dav-cli --start --port 1234');
  console.log();
  console.log('    - Start a local Ethereum node on port 1234');
  console.log('      $ dav-cli --port 1234');
  console.log();
  console.log('  Find out more at https://developers.dav.network');
});

// Configure the CLI
program
  .version(version)
  .description(`DAV CLI v${version} - makes developing with DAV easy`)
  .option('-s, --start', 'Start a local Ethereum node')
  .option('-p, --port <n>', 'Port for Ethereum node to listen to')
  .parse(process.argv);

console.log(`DAV CLI v${version} - makes developing with DAV easy`+OS.EOL);

// Start a local Ethereum server
if (program.start || program.port) {
  const port = program.port || 8545;
  const server = ganache.server();
  server.listen(port, (/*err, blockchain*/) => {
    console.log(`Local Ethereum node running. Listening on port ${port}.`);
  });
}
