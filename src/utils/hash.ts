import {config} from '../config';
import {
  hashPersonalMessage,
  bufferToHex,
  toBuffer,
  ecsign
} from 'ethereumjs-util';

const {mapValues} = require('lodash');
const {soliditySha3} = require('web3-utils');
const IDEXcontractAddress = '0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208';
const privateKeyBuffer = Buffer.from(
  config.privateKey.replace('0x', ''),
  'hex'
);

const getSignedHash = (raw: object) => {
  const salted = hashPersonalMessage(toBuffer(raw));
  const {v, r, s} = mapValues(
    ecsign(salted, privateKeyBuffer),
    (value: Buffer, key: string) => (key === 'v' ? value : bufferToHex(value))
  );
  return {v, r, s};
};

/**
 * Uses private key to hash and sign the transaction
 * @param {*} expires
 * @param {*} nonce
 */
export const hashAndSign = (
  tokenBuy: string,
  amountBuy: string,
  tokenSell: string,
  amountSell: string,
  expires: string,
  nonce: string
) => {
  const raw = soliditySha3(
    {
      t: 'address',
      v: IDEXcontractAddress
    },
    {
      t: 'address',
      v: tokenBuy
    },
    {
      t: 'uint256',
      v: amountBuy
    },
    {
      t: 'address',
      v: tokenSell
    },
    {
      t: 'uint256',
      v: amountSell
    },
    {
      t: 'uint256',
      v: expires
    },
    {
      t: 'uint256',
      v: nonce
    },
    {
      t: 'address',
      v: config.address
    }
  );
  return getSignedHash(raw);
};

export const hashAndSignForCancel = (orderHash: string, nonce: string) => {
  const raw = soliditySha3(
    {
      t: 'uint256',
      v: orderHash
    },
    {
      t: 'uint256',
      v: nonce
    }
  );
  return getSignedHash(raw);
};
