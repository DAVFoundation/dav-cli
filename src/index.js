const program = require('commander');
const version = require('./lib/version');
const OS = require('os');
const fs = require('fs');
const { sep } = require('path');
const chalk = require('chalk');
const {
  createPrivateKey,
  openKeystore,
  signRegistration,
  privateKeyToAddress,
} = require('./lib/cryptography');
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
  
    - Register a new Identity on the blockchain
      $ dav-cli --register ~/.dav/0xd14e3aca4d62c8e7b150fc63dabb8fb4b3485263
  
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
    'Generate a private-public key pair for a new Identity',
  )
  .option('-r, --register <s>', 'Register a new Identity on the blockchain')
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
  const privateKey = createPrivateKey();

  // Save the key to filesystem
  const keyFilename = program.genkey + sep + '0x' + privateKey.address;
  fs.writeFileSync(keyFilename, JSON.stringify(privateKey));

  console.log('Keyfile saved to ' + chalk.blue.bold.underline(keyFilename));
}

// Register a new Identity on the blockchain
if (program.register) {
  const keyFilename = program.register;
  try {
    const privateKey = openKeystore(JSON.parse(fs.readFileSync(keyFilename)));
    const address = privateKeyToAddress(privateKey);
    const signature = signRegistration(address, privateKey);
    console.log(signature);
  } catch (error) {
    console.log(error);
    console.log(
      'Unable to open key file ' + chalk.blue.bold.underline(keyFilename),
    );
  }
}
