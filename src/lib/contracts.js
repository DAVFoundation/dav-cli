const chalk = require('chalk');

const TOTAL_DAV_SUPPLY = '0xffffffffffffffffffffffffffff';

const deployContract = async (web3, contractDetails, args) => {
  const deployingAccount = (await web3.eth.getAccounts())[0];

  // Create contract instance
  const contract = new web3.eth.Contract(contractDetails.abi, {
    data: contractDetails.bytecode
  });

  // Estimate gas
  const gasLimit = await web3.eth.estimateGas({
    data: contractDetails.bytecode
  });

  // Deploy contract
  return await contract.deploy({ arguments: args }).send({
    from: deployingAccount,
    gasLimit: gasLimit * 3
  });
};

const contractJsonDAVToken = require('../../contracts/DAVToken.json');
const contractJsonIdentity = require('../../contracts/Identity.json');
const contractJsonBasicMission = require('../../contracts/BasicMission.json');

const deployContracts = async web3 => {
  const contractDAVToken = await deploySingleContract(web3, contractJsonDAVToken, [TOTAL_DAV_SUPPLY]);
  const contractIdentity = await deploySingleContract(web3, contractJsonIdentity, [contractDAVToken.options.address]);
  const contractBasicMission = await deploySingleContract(web3, contractJsonBasicMission, [contractIdentity.options.address, contractDAVToken.options.address]);
  return { contractDAVToken, contractIdentity, contractBasicMission };
};

async function deploySingleContract(web3, contractJson, args) {
  console.log(`Deploying ${contractJson.contractName}...`);
  const contract = await deployContract(web3, contractJson, args);
  contract.events.allEvents(
    {
      fromBlock: 0,
      toBlock: 'latest'
    }, (...args) => {
      console.log(chalk.blue(`Contract Event (${contractJson.contractName}): `), chalk.blue.bold(args.join(' , ')));
    });

  console.log(`${contractJson.contractName} contract: ${chalk.green.bold(contract.options.address)}`);
  return contract;
}

module.exports = {
  deployContracts
};
