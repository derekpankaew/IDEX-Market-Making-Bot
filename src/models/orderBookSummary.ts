import {Big} from 'big.js';

export interface OrderBookSummary {
  count: number;
  positionInBook: number | undefined;
  orderAmount: number;
  volumeAboveMe: number;
  priceAboveWave: Big;
  orderPrice?: number;
  isBuy: boolean;
}
