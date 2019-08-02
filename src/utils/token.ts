import {Big} from 'big.js';
import {hashAndSign} from './hash';
import {OrderBookSummary} from '../models/orderBookSummary';
import {CurrencyInfo} from '../models/currencyInfo';
import {IDEXAPI} from './api';

export const DEFAULT_ETH_CONTRACT_ADDRESS =
  '0x0000000000000000000000000000000000000000';
const EXPIRES = '100000';

export const calculateAmount = (
  tokenPrice: Big,
  howMuchInETH: Big,
  precision: number
): string => {
  let precisionMultiplier = Big(10).pow(precision);
  let amount = howMuchInETH.div(tokenPrice);
  amount = Big(amount).times(precisionMultiplier);
  return amount.toFixed(0);
};

export const getTokenOrderParams = async (
  orderBookSummary: OrderBookSummary,
  orderETHAmount: Big,
  currencyInfo: CurrencyInfo
) => {
  const tokenBuy = orderBookSummary.isBuy
    ? currencyInfo.contractAddress
    : DEFAULT_ETH_CONTRACT_ADDRESS;
  const amountBuy = orderBookSummary.isBuy
    ? calculateAmount(
        orderBookSummary.priceAboveWave,
        orderETHAmount,
        currencyInfo.presition
      )
    : orderETHAmount.times(Math.pow(10, 18)).toFixed(0);
  const tokenSell = orderBookSummary.isBuy
    ? DEFAULT_ETH_CONTRACT_ADDRESS
    : currencyInfo.contractAddress;
  const amountSell = orderBookSummary.isBuy
    ? orderETHAmount.times(Math.pow(10, 18)).toFixed(0)
    : calculateAmount(
        orderBookSummary.priceAboveWave,
        orderETHAmount,
        currencyInfo.presition
      );
  const nonce = await IDEXAPI.getNextNone();
  const {v, r, s} = hashAndSign(
    tokenBuy,
    amountBuy,
    tokenSell,
    amountSell,
    EXPIRES,
    nonce
  );
  return {
    tokenBuy,
    amountBuy,
    tokenSell,
    amountSell,
    expires: EXPIRES,
    nonce,
    v,
    r,
    s
  };
};
