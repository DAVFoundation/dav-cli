const ganache = require('ganache-cli');
const { deployContracts } = require('../lib/contracts');
const chalk = require('chalk');
const util = require('util');
const eth = require('ethereumjs-wallet');
const Web3 = require('web3');
require('events').EventEmitter.defaultMaxListeners = 100;

const REGISTRATION_REQUEST_HASH = new Web3().utils.sha3(
  'DAV Identity Registration'
);

const LOTS_OF = '0xffffffffffffffffffffffffffff';
const BIT_LESS = '0xfffffffffffffffffffffff';
const NUM_ACCOUNTS = 10;
const PORT = 8545;


const startTestnet = (port = PORT) => {
  let accounts = Array(NUM_ACCOUNTS).fill(undefined).map(() => eth.generate());
  const server = ganache.server({
    accounts: accounts.map((account) => ({
      balance: LOTS_OF,
      secretKey: account.getPrivateKeyString()
    })),
    // logger: {
    // log: (...args) => { console.log(chalk.cyan('Genache Log: '), chalk.magenta(args.map(arg => JSON.stringify(arg)).join(' , '))); }
    // },
    ws: true
    // , debug: true
  });

  server.listen(port, async () => {
    try {
      const ethNodeUrl = `http://localhost:${port}`;

      console.log(
        'Local Ethereum testnet started on ' +
        chalk.blue.bold.underline(ethNodeUrl)
      );

      // const provider = server.provider;
      const web3 = new Web3(new Web3.providers.WebsocketProvider(ethNodeUrl));

      const { contractDAVToken, contractIdentity/* , contractBasicMission */ } = await deployContracts(web3);

      for (const account of accounts) {
        await registerAccount(web3, contractIdentity, account);
        if (account.getAddressString() !== accounts[0].getAddressString()) {
          await transferDAV(web3, contractDAVToken, accounts[0], account);
        }
      }

      accounts.forEach(async account => {
        const balance = await callContractMethod(contractDAVToken.methods.balanceOf(account.getAddressString()));
        console.log(`Addr: ${chalk.magenta.underline(account.getAddressString())} PrivateKey: ${chalk.gray.bold(account.getPrivateKeyString())} DAV: ${balance}`);
      });
    }
    catch (err) {
      console.error(util.inspect(err));
      process.exit(0);
    }
  });
};

module.exports = {
  startTestnet
};

async function registerAccount(web3, contractIdentity, account) {
  const id = account.getAddressString();
  const idPK = account.getPrivateKeyString();
  const walletAddress = account.getAddressString();
  const walletPK = account.getPrivateKeyString();

  const { sign } = web3.eth.accounts.privateKeyToAccount(idPK);
  const { v, r, s } = sign(REGISTRATION_REQUEST_HASH);

  return await callContractTransaction(web3,
    contractIdentity.methods.register(id, v, r, s),
    walletAddress,
    contractIdentity.options.address,
    '0',
    walletPK
  );
}

async function transferDAV(web3, contractDAVToken, accountSender, accountReceiver) {
  return await callContractTransaction(web3,
    contractDAVToken.methods.transfer(accountReceiver.getAddressString(), BIT_LESS),
    accountSender.getAddressString(),
    contractDAVToken.options.address,
    '0',
    accountSender.getPrivateKeyString()
  );
}

async function callContractTransaction(web3, contractMethod, from, to, value, signPK) {
  const { encodeABI, estimateGas } = await contractMethod;
  const encodedABI = encodeABI();
  const estimatedGas = await estimateGas({ from: from });
  const safeGasLimit = Math.min(estimatedGas + 100, 4000000);
  const gasPrice = await web3.eth.getGasPrice();
  const tx = {
    data: encodedABI,
    from: from,
    to: to,
    value: value,
    gas: safeGasLimit,
    gasPrice
  };
  const { rawTransaction } = await web3.eth.accounts.signTransaction(tx, signPK);
  const transactionReceipt = await new Promise((resolve, reject) => {
    const transaction = web3.eth.sendSignedTransaction(rawTransaction);
    transaction.once('receipt', receipt => {
      resolve(receipt);
    });
    transaction.on('error', err => {
      reject(err);
    });
  });

  return transactionReceipt.transactionHash;
}

async function callContractMethod(contractMethod) {
  const method = await contractMethod;
  const result = await new Promise((resolve, reject) => {
    method.call((err, res) => {
      if (!err) {
        resolve(res);
      }
      else {
        reject(err);
      }
    });
  });
  return result;
}
