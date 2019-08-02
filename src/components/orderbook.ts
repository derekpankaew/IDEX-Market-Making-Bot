import {config} from '../config';
import {Big} from 'big.js';
import {OrderBookSummary} from '../models/orderBookSummary';

const calculateOrderCount = (orders: Array<any>) => {
  let firstOrderNumber: number | undefined = undefined;
  const orderCount = orders.reduce((acc: number, order: any) => {
    if (config.address === order.params.user) {
      if (firstOrderNumber === undefined) {
        firstOrderNumber = orders.indexOf(order);
      }
      return acc + 1;
    }
    return acc;
  }, 0);
  return {orderCount, firstOrderNumber};
};

export class OrderBook {
  orderBook: number;
  isBuy: boolean;
  orders: Array<any>;
  orderCount: number;
  firstOrderNumber: number | undefined;
  constructor(orderBook: any, isBuy: boolean) {
    this.orderBook = orderBook;
    this.isBuy = isBuy;
    this.orders = isBuy ? orderBook.bids : orderBook.asks;
    const {orderCount, firstOrderNumber} = calculateOrderCount(this.orders);
    this.orderCount = orderCount;
    this.firstOrderNumber = firstOrderNumber;
  }

  getSummary(): OrderBookSummary {
    return {
      count: this.orderCount,
      positionInBook: this.firstOrderNumber,
      orderAmount: this.getFirstOrderAmount(),
      volumeAboveMe: this.calculateVolumeAboveOrder(),
      priceAboveWave: this.calculatePriceNeededToStay(),
      orderPrice: this.getFirstOrderPrice(),
      isBuy: this.isBuy
    };
  }

  private getFirstOrder() {
    return this.firstOrderNumber
      ? this.orders[this.firstOrderNumber]
      : undefined;
  }

  private calculateVolumeAboveOrder(): number {
    if (!this.firstOrderNumber) {
      return 0;
    }
    let volumeAboveAsk: number = 0;
    for (let i = 0; i < this.firstOrderNumber; i++) {
      volumeAboveAsk += parseFloat(this.orders[i].total);
    }
    return volumeAboveAsk;
  }

  private calculatePriceNeededToStay(): Big {
    let tempTotal = 0;
    let priceNeededToStay = Big(0);
    for (let i = 0; this.orders.length; i++) {
      const order = this.orders[i];
      tempTotal += parseFloat(order.total);
      if (tempTotal > config.averageWaveSize) {
        const price = Big(order.price);
        priceNeededToStay = this.isBuy
          ? price.plus(config.incrementAmount)
          : price.minus(config.incrementAmount);
        break;
      }
    }
    return priceNeededToStay;
  }

  private getFirstOrderAmount(): number {
    const firstOrder = this.getFirstOrder();
    return firstOrder ? parseFloat(firstOrder.amount) : 0;
  }

  private getFirstOrderPrice(): number | undefined {
    const firstOrder = this.getFirstOrder();
    return firstOrder ? parseFloat(firstOrder.price) : undefined;
  }
}
