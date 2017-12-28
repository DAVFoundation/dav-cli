const chalk = require('chalk');

const deployContract = async (web3, contractDetails) => {
  const deployingAccount = (await web3.eth.getAccounts())[0];

  // Create contract instance
  const contract = new web3.eth.Contract(contractDetails.abi, {
    data: contractDetails.bytecode,
  });

  // Estimate gas
  const gasLimit = await web3.eth.estimateGas({
    data: contractDetails.bytecode,
  });

  // Deploy contract
  return await contract.deploy().send({
    from: deployingAccount,
    gasLimit: gasLimit,
  });
};

const deployContracts = async web3 => {
  return await deployContract(
    web3,
    require('../contracts/DAVToken.json'),
  );
};

module.exports = {
  deployContracts,
};
