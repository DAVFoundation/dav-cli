const keythereum = require('keythereum');
const { keccak256 } = require('js-sha3');
const { ecsign } = require('ethereumjs-util');
const config = require('../config');

const defaultPassword = config('password_default');

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
    privateKey.iv
  );
};

const openKeystore = (keyStore, password = defaultPassword) => {
  return keythereum.recover(password, keyStore);
};

const signRegistration = (address, privateKey) => {
  const message = keccak256(address);
  const signature = ecsign(Buffer.from(message, 'hex'), privateKey);
  const v = signature.v;
  const r = signature.r.toString('hex');
  const s = signature.s.toString('hex');

  return {
    address,
    v: v,
    r: '0x' + r,
    s: '0x' + s
  };
};

const privateKeyToAddress = privateKey =>
  keythereum.privateKeyToAddress(privateKey.toString('hex'));

module.exports = {
  createPrivateKey,
  openKeystore,
  signRegistration,
  privateKeyToAddress
};
