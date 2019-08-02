import fs from 'fs';

const baseDic = 'resources/';

const readFile = (filename: String) =>
  fs.readFileSync(`${baseDic}${filename}`, 'utf8');
const writeFile = (filename: String, data: String) =>
  fs.writeFileSync(`${baseDic}${filename}`, data, 'utf8');

export const getSettingFile = (): string => readFile('settings.json');
export const getOrderHashAsk = (): string => readFile('order_hash_ask.json');
export const getOrderHashBid = (): string => readFile('order_hash_bid.json');
export const getNonce = (): number => parseFloat(readFile('nonce.json'));

export const writeOrderHash = (orderHash: String, isBuy: Boolean) => {
  if (orderHash !== undefined) {
    writeFile(isBuy ? 'order_hash_bid.json' : 'order_hash_ask.json', orderHash);
  }
};

export const writeNonce = (nonce: number) => {
  writeFile('nonce.json', String(nonce));
};
