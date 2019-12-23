const ganache = require('ganache-cli');
const { deployContracts } = require('../lib/contracts');
const chalk = require('chalk');
const util = require('util');
const eth = require('ethereumjs-wallet');
const Web3 = require('web3');

const REGISTRATION_REQUEST_HASH = new Web3().utils.sha3(
  'DAV Identity Registration'
);

const LOTS_OF = '0xffffffffffffffffffffffffffff';
const NUM_ACCOUNTS = 2;
const PORT = 8545;

const startTestnet = (port = PORT) => {
  let accounts = Array(NUM_ACCOUNTS).fill(undefined).map(() => eth.generate());
  const server = ganache.server({
    accounts: accounts.map((account) => ({
      balance: LOTS_OF,
      secretKey: account.getPrivateKeyString()
    }))
  });


  server.listen(port, async () => {
    try {
      const ethNodeUrl = `http://localhost:${port}`;

      console.log(
        'Local Ethereum testnet started on ' +
        chalk.blue.bold.underline(ethNodeUrl)
      );

      const web3 = new Web3(
        new Web3.providers.HttpProvider(ethNodeUrl)
      );

      const { contractDAVToken, contractIdentity/* , contractBasicMission */ } = await deployContracts(web3);


      await Promise.all(accounts.map(async account => {
        await registerAccount(web3, contractIdentity, account);
        // await transferDAV(web3, contractDAVToken, accounts[0], account);
      }));

      const balance0 = await callContractMethod(
        contractDAVToken.methods.balanceOf(accounts[0].getAddressString()));
      const balance1a = await callContractMethod(
        contractDAVToken.methods.balanceOf(accounts[1].getAddressString()));

      const res = await callContractTransaction(web3,
        contractDAVToken.methods.transfer(accounts[1].getAddressString(), '1000000'),
        accounts[0].getAddressString(),
        accounts[1].getAddressString(),
        '0',
        accounts[0].getPrivateKeyString()
      );

      const status = await web3.eth.getTransactionReceipt(res);
      let balance1b = await callContractMethod(
        contractDAVToken.methods.balanceOf(accounts[1].getAddressString()));
      console.log(balance0, balance1a, balance1b, status);

      accounts.forEach(account => {
        console.log(`Addr: ${chalk.magenta.underline(account.getAddressString())} PrivateKey: ${chalk.gray.bold(account.getPrivateKeyString())}`);
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

/* async function transferDAV(web3, contractDAVToken, accountSender, accountReceiver) {
  return await callContractTransaction(web3,
    contractDAVToken.methods.transfer(accountReceiver.getAddressString(), LOTS_OF),
    accountSender.getAddressString(),
    accountReceiver.getAddressString(),
    LOTS_OF,
    accountSender.getPrivateKeyString()
  );
} */

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
