const program = require('commander');
const version = require('./lib/version');
const OS = require('os');
const chalk = require('chalk');
const { startTestnet } = require('./controllers/blockchain');
const { generateKeyFile, registerIdentity } = require('./controllers/identity');
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

console.log(pkg);

// Checks for available update and returns an instance
const notifier = updateNotifier({ pkg });

// Notify using the built-in convenience method
notifier.notify();

// `notifier.update` contains some useful info about the update
console.log(notifier.update);
/*
{
	latest: '1.0.1',
	current: '1.0.0',
	type: 'patch', // Possible values: latest, major, minor, patch, prerelease, build
	name: 'pageres'
}
*/

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
    'Generate a private-public key pair for a new Identity'
  )
  .option('-r, --register <s>', 'Register a new Identity on the blockchain')
  .parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}

console.log(`DAV CLI v${version} - makes developing with DAV easy` + OS.EOL);

// Start a local Ethereum server
if (program.start || program.port) {
  startTestnet(program.port);
}

// Generate a new key pair
if (program.genkey) {
  const keyFilename = generateKeyFile(program.genkey);
  console.log('Keyfile saved to ' + chalk.blue.bold.underline(keyFilename));
}

// Register a new Identity on the blockchain
if (program.register) {
  try {
    const signature = registerIdentity(program.register);
    console.log(signature);
  } catch (e) {
    console.error(chalk.red.bold(e.message));
  }
}
