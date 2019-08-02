import {assert} from 'chai';
import {Balance} from '../../src/components/balance';
import {Big} from 'big.js';
import {OrderBookSummary} from '../../src/models/orderBookSummary';

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

describe('#Balance', () => {
  it('getOrderETHAmount() works correctly', async () => {
    const askOrderSummary = getOrderBookSummary(0.041110610763819669);
    const bidOrderSummary = getOrderBookSummary(0.040500100000000001, false);
    const myBalanceETH = new Balance(Big(6.8645627));
    const myBalanceTokens = new Balance(Big(167.4286444189528), true);

    const newOrderSellTokenETHAmount = myBalanceETH.getOrderETHAmount(
      askOrderSummary
    );
    const newOrderBuyTokenETHAmount = myBalanceETH.getOrderETHAmount(
      bidOrderSummary
    );
    const maintainSellTokenETHAmount = myBalanceETH.getOrderETHAmount(
      askOrderSummary,
      true
    );
    const maintainBuyTokenETHAmount = myBalanceETH.getOrderETHAmount(
      bidOrderSummary,
      true
    );

    console.log('=== new order for buy/sell ETH ===');
    console.log(newOrderBuyTokenETHAmount.toFixed());
    console.log(newOrderSellTokenETHAmount.toFixed());
    console.log('=== maintain for buy/sell ETH ===');
    console.log(maintainBuyTokenETHAmount.toFixed());
    console.log(maintainSellTokenETHAmount.toFixed());
    assert.equal(newOrderBuyTokenETHAmount.toFixed(), '6.8644627');
    assert.equal(newOrderBuyTokenETHAmount.toFixed(), '6.8644627');
    assert.equal(newOrderBuyTokenETHAmount.toFixed(), '6.8644627');
    assert.equal(newOrderBuyTokenETHAmount.toFixed(), '6.8644627');

    const newOrderSellETHAmount = myBalanceTokens.getOrderETHAmount(
      askOrderSummary
    );
    const newOrderBuyETHAmount = myBalanceTokens.getOrderETHAmount(
      bidOrderSummary
    );
    const maintainSellETHAmount = myBalanceTokens.getOrderETHAmount(
      askOrderSummary,
      true
    );
    const maintainBuyETHAmount = myBalanceTokens.getOrderETHAmount(
      bidOrderSummary,
      true
    );
    console.log('=== new order for buy/sell ETH ===');
    console.log(newOrderBuyETHAmount.toFixed());

    console.log(newOrderSellETHAmount.toFixed());
    console.log('=== maintain for buy/sell ETH ===');
    console.log(maintainBuyETHAmount.toFixed());
    console.log(maintainSellETHAmount.toFixed());

    assert.equal(
      newOrderBuyETHAmount.toFixed(),
      '6.7808727918220309649941776758112'
    );
    assert.equal(
      maintainBuyETHAmount.toFixed(),
      '6.7808727918220309649941776758112'
    );

    assert.equal(
      newOrderSellETHAmount.toFixed(),
      '6.8830897203604600461586917657648'
    );

    assert.equal(
      maintainSellETHAmount.toFixed(),
      '6.8830897203604600461586917657648'
    );
  });
});
