const ganache = require('ganache-cli');
const { deployContracts } = require('../lib/contracts');
const chalk = require('chalk');
const util = require('util');

const startTestnet = (port = 8545) => {
  const server = ganache.server();
  server.listen(port, async () => {
    try {
      console.log(
        'Local Ethereum testnet started on ' +
        chalk.blue.bold.underline(`http://localhost:${port}`)
      );

      const Web3 = require('web3');
      const web3 = new Web3(
        new Web3.providers.HttpProvider(`http://localhost:${port}`)
      );

      await deployContracts(web3);
    } catch (err) {
      console.error(util.inspect(err));
      process.exit(0);
    }
  });
};

module.exports = {
  startTestnet
};
