const program = require('commander');
const version = require('./lib/version');
const OS = require('os');
const fs = require('fs');
const { sep } = require('path');
const chalk = require('chalk');
const crypto = require('./lib/cryptography');
const ganache = require('ganache-cli');
const { deployContracts } = require('./contracts');

program.on('--help', () => {
  console.log(`
  Examples:

    - Start a local Ethereum node on the default port
      $ dav-cli --start
  
    - Start a local Ethereum node on port 1234
      $ dav-cli --start --port 1234
  
    - Generate a new private-public key pair and save it to the ~/.dav directory
      $ dav-cli --genkey ~/.dav
  
  Find out more at https://developers.dav.network`);
});

// Configure the CLI
program
  .version(version)
  .description(`DAV CLI v${version} - makes developing with DAV easy`)
  .option('-s, --start', 'Start a local Ethereum node')
  .option('-p, --port <n>', 'Port for Ethereum node to listen to')
  .option(
    '--genkey <s>',
    'Generate a private-public key pair for a new identity',
  )
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

console.log(`DAV CLI v${version} - makes developing with DAV easy` + OS.EOL);

// Start a local Ethereum server
if (program.start || program.port) {
  const port = program.port || 8545;
  const server = ganache.server();
  server.listen(port, () => {
    console.log(
      'Local Ethereum testnet started on ' +
        chalk.blue.bold.underline(`http://localhost:${port}`),
    );

    const Web3 = require('web3');
    const web3 = new Web3(
      new Web3.providers.HttpProvider(`http://localhost:${port}`),
    );

    deployContracts(web3);
  });
}

// Generate a new key pair
if (program.genkey) {
  // generate the key
  const privateKey = crypto.createPrivateKey();

  // Save the key to filesystem
  const keyFilename = program.genkey + sep + privateKey.address;
  fs.writeFileSync(keyFilename, JSON.stringify(privateKey));

  console.log('Keyfile saved to ' + chalk.blue.bold.underline(keyFilename));
}
