const deployContracts = async web3 => {
  const deployingAccount = (await web3.eth.getAccounts())[0];

  const compiledContracts = {
    DAVToken: require('../contracts/DAVToken.json'),
  };

  // Create DAVToken contract instance
  const DAVTokenContract = new web3.eth.Contract(
    compiledContracts.DAVToken.abi,
    { data: compiledContracts.DAVToken.bytecode },
  );

  // Estimate gas
  let gasLimit = await web3.eth.estimateGas({
    data: compiledContracts.DAVToken.bytecode,
  });

  // Deploy DAVToken contract
  const DAVToken = await DAVTokenContract.deploy().send({
    from: deployingAccount,
    gasLimit: gasLimit,
  });

  console.log('DAVToken contract: ' + DAVToken.options.address);
};

module.exports = {
  deployContracts,
};
