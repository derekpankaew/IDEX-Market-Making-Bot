import {config} from '../config';
import {getOrderHashAsk, getOrderHashBid} from '../utils/file';
import {IDEXAPI} from '../utils/api';
import {Balance} from './balance';
import {CurrencyInfo} from '../models/currencyInfo';
import {OrderBookSummary} from '../models/orderBookSummary';

export class Maintenance {
  currencyInfo: CurrencyInfo;
  order: OrderBookSummary;
  balance: Balance;
  constructor(
    currencyInfo: CurrencyInfo,
    order: OrderBookSummary,
    balance: Balance
  ) {
    this.currencyInfo = currencyInfo;
    this.order = order;
    this.balance = balance;
  }

  async mainteinBuyOrders() {
    if (this.validate() || !this.order.volumeAboveMe) {
      console.log('validation error!');
      return;
    }
    if (this.order.volumeAboveMe > config.averageWaveSize) {
      // TODO: rebuy not yet coded
      const hashToCancel = getOrderHashBid();
      await IDEXAPI.cancelOrder(hashToCancel);
      await IDEXAPI.order(
        this.order,
        this.balance.getOrderETHAmount(this.order, true),
        this.currencyInfo
      );
    }
  }

  async mainteinSellOrders() {
    if (this.validate()) {
      console.log('validation error!');
      return;
    }
    if (
      this.balance.amount
        .plus(this.order.orderAmount)
        .times(this.currencyInfo.lastOrderPrice)
        .cmp(0.15) === -1
    ) {
      console.log("I don't have enough tokens to process a sell order.");
      return;
    }
    if (this.currencyInfo.lastOrderPrice.cmp(config.stoploss) !== 1) {
      // TODO: I should cancel and rebuy
      return;
    }
    if (this.order.volumeAboveMe > config.averageWaveSize) {
      const hashToCancel = getOrderHashAsk();
      await IDEXAPI.cancelOrder(hashToCancel);
      await IDEXAPI.order(
        this.order,
        this.balance.getOrderETHAmount(this.order, true),
        this.currencyInfo
      );
    }
  }
  validate() {
    if (this.order.count === 0) {
      console.log("I don't have any orders on the order book.");
      return true;
    }
  }
}
