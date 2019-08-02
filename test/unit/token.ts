import {
  calculateAmount,
  getTokenOrderParams,
  DEFAULT_ETH_CONTRACT_ADDRESS
} from '../../src/utils/token';
import {assert} from 'chai';
import {Big} from 'big.js';
import {OrderBookSummary} from '../../src/models/orderBookSummary';
import {Balance} from '../../src/components/balance';
import {CurrencyInfo} from '../../src/models/currencyInfo';

const getOrderBookSummary = (
  priceAboveWave: number,
  isBuy: boolean = true
): OrderBookSummary => {
  return {
    count: 1,
    positionInBook: undefined,
    orderAmount: 0,
    volumeAboveMe: 0,
    priceAboveWave: Big(priceAboveWave),
    orderPrice: undefined,
    isBuy: isBuy
  };
};

describe('Transactiuon Caluculator', () => {
  it('#token.calculateAmount() calculates correctly', async () => {
    assert.equal(
      calculateAmount(Big(0.04), Big(6.99), 18),
      // 6.99(ETH) / 0.04(token price) * 0.000000000000000001(presicion)
      '174750000000000000000'
    );
  });

  it('#token.getTokenOrderParams() returns correctly', async () => {
    const QNT_CONTRACT_ADDRESS = '0x4a220e6096b25eadb88358cb44068a3248254675';
    const currencyInfo: CurrencyInfo = {
      contractAddress: QNT_CONTRACT_ADDRESS,
      presition: 18,
      lastOrderPrice: Big(0.04104382)
    };
    const askOrderSummary = getOrderBookSummary(0.041110610763819669, false);
    const bidOrderSummary = getOrderBookSummary(0.040500100000000001, true);
    const myBalanceETH = new Balance(Big(6.8645627));
    const myBalanceTokens = new Balance(Big(167.4286444189528), true);
    const params = await getTokenOrderParams(
      askOrderSummary,
      myBalanceETH.getOrderETHAmount(askOrderSummary),
      currencyInfo
    );
    // Sell 166.9 QNT with 6.8644 ETH
    assert.isFalse(askOrderSummary.isBuy);
    assert.equal(params.tokenBuy, DEFAULT_ETH_CONTRACT_ADDRESS);
    assert.equal(params.amountBuy, '6864462700000000000');
    assert.equal(params.tokenSell, QNT_CONTRACT_ADDRESS);
    assert.equal(params.amountSell, '166975449220064312997');

    const tokenParams = await getTokenOrderParams(
      bidOrderSummary,
      myBalanceTokens.getOrderETHAmount(bidOrderSummary),
      currencyInfo
    );
    // Buy 167.4285 QNT with 6.7808727 ETH
    assert.isTrue(bidOrderSummary.isBuy);
    assert.equal(tokenParams.tokenBuy, QNT_CONTRACT_ADDRESS);
    assert.equal(tokenParams.amountBuy, '167428544418952800000');
    assert.equal(tokenParams.tokenSell, DEFAULT_ETH_CONTRACT_ADDRESS);
    assert.equal(tokenParams.amountSell, '6780872791822030965');
  });
});
