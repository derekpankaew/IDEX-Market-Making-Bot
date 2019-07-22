import {privateToAddress} from 'ethereumjs-util';
import {Big} from 'big.js';
import {getSettingFile} from './utils/file';

class Config {
  private static instantce: Config;
  targetPair: string;
  targetToken: string;
  stoploss: number;
  averageWaveSize: number;
  incrementAmount: Big;
  privateKey: string;
  address: string;
  dryRun: boolean;
  private constructor() {
    const {
      targetPair,
      stoploss,
      averageWaveSize,
      incrementAmount,
      privateKey,
      dryRun
    } = JSON.parse(getSettingFile());
    this.targetPair = targetPair;
    this.targetToken = targetPair.split('_')[1];
    this.stoploss = stoploss;
    this.averageWaveSize = averageWaveSize;
    this.incrementAmount = Big(incrementAmount);
    this.privateKey = privateKey;
    this.address = `0x${privateToAddress(privateKey).toString('hex')}`;
    this.dryRun = dryRun;
  }

  static getInstance(): Config {
    if (!Config.instantce) {
      Config.instantce = new Config();
    }
    return Config.instantce;
  }
}

export const config = Config.getInstance();
