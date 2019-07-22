import {Big} from 'big.js';

export interface CurrencyInfo {
  contractAddress: string;
  presition: number;
  lastOrderPrice: Big;
}
