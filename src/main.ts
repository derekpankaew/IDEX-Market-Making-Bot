import {OrderBook} from './components/orderBook';
import {Order} from './components/newOrder';
import {Maintenance} from './components/maintenance';
import {IDEXAPI} from './utils/api';
import {CurrencyInfo} from './models/currencyInfo';

const runBot = async (currencyInfo: CurrencyInfo) => {
  const [myBalanceETH, myBalanceTokens] = await IDEXAPI.getETHBalance();
  const orderBook = await IDEXAPI.getOrderBook();
  const askOrderSummary = new OrderBook(orderBook, true).getSummary();
  const bidOrderSummary = new OrderBook(orderBook, false).getSummary();
  await new Maintenance(
    currencyInfo,
    askOrderSummary,
    myBalanceTokens
  ).mainteinSellOrders();
  await new Maintenance(
    currencyInfo,
    bidOrderSummary,
    myBalanceETH
  ).mainteinBuyOrders();
  await new Order(currencyInfo, bidOrderSummary, myBalanceETH).newOrder();
  await new Order(currencyInfo, askOrderSummary, myBalanceTokens).newOrder();
};

const main = async () => {
  const currencyInfo: CurrencyInfo = await IDEXAPI.getTargetCurrencyInfo();
  await runBot(currencyInfo);
  process.exit();
  setInterval(() => runBot(currencyInfo), 3000);
};

main();
