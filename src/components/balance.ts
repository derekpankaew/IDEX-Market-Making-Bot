import {Big} from 'big.js';
import {OrderBookSummary} from '../models/orderBookSummary';

const GAS_FEE = 0.0001;

export class Balance {
  amount: Big;
  isToken: boolean;

  constructor(amount: Big, isToken: boolean = false) {
    this.amount = Big(amount);
    this.isToken = isToken;
  }

  getOrderETHAmount(
    orderBookSummary: OrderBookSummary,
    isMaintenance: boolean = false
  ): Big {
    const amountWithoutGASFee = this.amount.minus(GAS_FEE);
    return !this.isToken
      ? amountWithoutGASFee
      : isMaintenance
      ? amountWithoutGASFee
          .plus(orderBookSummary.orderAmount)
          .times(orderBookSummary.priceAboveWave)
      : amountWithoutGASFee.times(orderBookSummary.priceAboveWave);
  }

  getAmount() {
    return this.amount;
  }
}
