const keythereum = require('keythereum');
const defaultPassword = '';

/**
 * Generates a new private key and returns it in keystore secret-storage format
 *
 * @param {string} password Password to lock keystore with
 * @returns {object}
 */
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
