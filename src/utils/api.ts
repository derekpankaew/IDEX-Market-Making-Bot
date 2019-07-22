import {config} from '../config';
import {Balance} from '../components/balance';
import {hashAndSignForCancel} from '../utils/hash';
import {writeOrderHash} from './file';
import {Big} from 'big.js';
import {getTokenOrderParams} from './token';
import axios from 'axios';
import {CurrencyInfo} from '../models/currencyInfo';
import {OrderBookSummary} from '../models/orderBookSummary';
const client = axios.create({
  baseURL: 'https://api.idex.market/'
});

const requestIDEXAPI = async (path: string, data = {}, isPost = false) => {
  const response = await client({
    method: isPost ? 'post' : 'get',
    url: path,
    data: data
  });
  return response.data;
};

const getTradeHistory = () => {
  return requestIDEXAPI(
    'returnTradeHistory',
    {
      market: config.targetPair
    },
    true
  );
};

const getBalance = () => {
  return requestIDEXAPI(
    'returnBalances',
    {
      address: config.address
    },
    true
  );
};

const getCurrencies = () => {
  return requestIDEXAPI('returnCurrencies');
};

export class IDEXAPI {
  static async getTargetCurrencyInfo(): Promise<CurrencyInfo> {
    const currencies = await getCurrencies();
    const {address, decimals} = currencies[config.targetToken];
    const targetCurrencyHistory = await getTradeHistory();
    return {
      contractAddress: address,
      presition: decimals,
      lastOrderPrice: Big(targetCurrencyHistory[0].price)
    };
  }

  static async getETHBalance(): Promise<[Balance, Balance]> {
    const data = await getBalance();
    const myBalanceETH = new Balance(data.ETH ? data.ETH : 0);
    const myBalanceTokens = new Balance(
      data[config.targetToken] ? data[config.targetToken] : 0,
      true
    );
    return [myBalanceETH, myBalanceTokens];
  }

  static getOrderBook() {
    return requestIDEXAPI(
      'returnOrderBook',
      {
        count: 100,
        market: config.targetPair
      },
      true
    );
  }

  static async order(
    orderBookSummary: OrderBookSummary,
    orderETHAmount: Big,
    currencyInfo: CurrencyInfo
  ) {
    const params = await getTokenOrderParams(
      orderBookSummary,
      orderETHAmount,
      currencyInfo
    );
    if (!config.dryRun) {
      const {orderHash} = await requestIDEXAPI('order', params, true);
      writeOrderHash(orderHash, orderBookSummary.isBuy);
    }
  }

  static async cancelOrder(orderHash: string) {
    if (!config.dryRun) {
      const nonce = await this.getNextNone();
      const {v, r, s} = hashAndSignForCancel(orderHash, nonce);
      return requestIDEXAPI(
        'cancel',
        {
          orderHash: orderHash,
          nonce: nonce,
          address: config.address,
          v: v,
          r: r,
          s: s
        },
        true
      );
    }
  }

  static async getNextNone() {
    const {nonce} = await requestIDEXAPI(
      'returnNextNonce',
      {
        address: config.address
      },
      true
    );
    return nonce;
  }
}
