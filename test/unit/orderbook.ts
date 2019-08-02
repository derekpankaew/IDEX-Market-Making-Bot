import {IDEXAPI} from '../../src/utils/api';
import {assert} from 'chai';
import {OrderBook} from '../../src/components/orderBook';

describe('#OrderBook', async () => {
  it('orderSummary params are set correctly', async () => {
    const orderBook = await IDEXAPI.getOrderBook();
    const askOrderSummary = new OrderBook(orderBook, false).getSummary();
    const bidOrderSummary = new OrderBook(orderBook, true).getSummary();
    console.log(`ask: PriceAboveWave => ${askOrderSummary.priceAboveWave}`);
    console.log(`bid: PriceAboveWave => ${bidOrderSummary.priceAboveWave}`);
    console.log(`ask: VolumeAboveMe => ${askOrderSummary.volumeAboveMe}`);
    console.log(`bid: VolumeAboveMe => ${bidOrderSummary.volumeAboveMe}`);
    assert.isTrue(
      askOrderSummary.priceAboveWave.cmp(bidOrderSummary.priceAboveWave) === 1
    );
    assert.isNumber(askOrderSummary.count);
    assert.isUndefined(askOrderSummary.positionInBook);
    assert.isNumber(askOrderSummary.orderAmount);
    assert.isNumber(askOrderSummary.volumeAboveMe);
    assert.isNotEmpty(askOrderSummary.priceAboveWave);
    assert.isUndefined(askOrderSummary.orderPrice);
    assert.isFalse(askOrderSummary.isBuy);

    assert.isNumber(bidOrderSummary.count);
    assert.isUndefined(bidOrderSummary.positionInBook);
    assert.isNumber(bidOrderSummary.orderAmount);
    assert.isNumber(bidOrderSummary.volumeAboveMe);
    assert.isNotEmpty(bidOrderSummary.priceAboveWave);
    assert.isUndefined(bidOrderSummary.orderPrice);
    assert.isTrue(bidOrderSummary.isBuy);
  });
});
