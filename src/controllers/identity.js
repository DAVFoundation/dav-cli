const { readFileSync, writeFileSync } = require('fs');
const { sep } = require('path');
const {
  createPrivateKey,
  openKeystore,
  signRegistration,
  privateKeyToAddress,
} = require('../lib/cryptography');

const generateKeyFile = directory => {
  // generate the key
  const privateKey = createPrivateKey();

  // Save the key to filesystem
  const keyFilename = directory + sep + '0x' + privateKey.address;
  writeFileSync(keyFilename, JSON.stringify(privateKey));

  return keyFilename;
};

const registerIdentity = keyFilename => {
  let privateKey;
  try {
    privateKey = openKeystore(JSON.parse(readFileSync(keyFilename)));
  } catch (error) {
    throw new Error('Unable to open key file');
  }
  const address = privateKeyToAddress(privateKey);
  return signRegistration(address, privateKey);
};

module.exports = {
  generateKeyFile,
  registerIdentity,
};
