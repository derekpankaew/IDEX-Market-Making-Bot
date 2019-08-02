import {config} from '../config';
import {Balance} from './balance';
import {IDEXAPI} from '../utils/api';
import {CurrencyInfo} from '../models/currencyInfo';
import {OrderBookSummary} from '../models/orderBookSummary';

export class Order {
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

  newOrder() {
    if (!this.validate() && this.order.priceAboveWave) {
      IDEXAPI.order(
        this.order,
        this.balance.getOrderETHAmount(this.order),
        this.currencyInfo
      );
    }
  }

  validate() {
    let hasError = false;
    if (this.order.count > 0) {
      console.log('I already have a order on the books.');
      hasError = true;
    }
    const amount = this.order.isBuy
      ? this.balance.getAmount()
      : this.balance.getAmount().times(this.currencyInfo.lastOrderPrice);
    if (amount.cmp(0.15) === -1) {
      console.log("I don't have enough tokens to process a new order.");
      hasError = true;
    }
    if (this.currencyInfo.lastOrderPrice.cmp(config.stoploss) === -1) {
      console.log('The price is below stoploss. Placing emergency order.');
      hasError = true;
    }
    return hasError;
  }
}
