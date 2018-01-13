const keythereum = require('keythereum');
const defaultPassword = '';

const createPrivateKey = (password = defaultPassword) => {
  const privateKey = keythereum.create();
  return keythereum.dump(
    password,
    privateKey.privateKey,
    privateKey.salt,
    privateKey.iv,
  );
};

module.exports = {
  createPrivateKey,
};
