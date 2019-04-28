///////////////////////////////
////////  Version   ///////////
///////////////////////////////

// Version 1.0, July 6, 2018

///////////////////////////////
////////  Constants   /////////
///////////////////////////////


const idex = require('./idex_sign_transaction.js');
const timestamp = require('./includes/timestamp.js');
const fs = require('fs');
const request = require('request');
const axios = require('axios');
const console2 = require("./includes/console2.js");
const settings = JSON.parse(fs.readFileSync('settings.json', "utf8"));

var highest_bid,lowest_ask,my_next_bid,hash_to_cancel,orderHash,are_we_at_the_top,order_book,trade_history,balances,myOrders,ask_count,bid_count,last_order_price;


///////////////////////////////
////////  SETTINGS   //////////
///////////////////////////////


var target_contract = settings.target_contract;
var target_pair = settings.target_pair;
var target_token = settings.target_token;
var precision = settings.precision;
var stoploss = settings.stoploss;
var average_wave_size = settings.average_wave_size;
var order_book_depth = 40;
const address = settings.myAddress; // My wallet address

var increment_amount = settings.increment_amount;
increment_amount = increment_amount.toFixed(10);

///////////////////////////////
//////  Declarations   ////////
///////////////////////////////

var my_order_number_bid = 0;
var my_order_data = {};
var my_balance_ETH = 0;
var my_balance_tokens = 0;


///////////////////////////////
///////  Run the Code   ///////
///////////////////////////////

// This is the "primary loop", which executes every 30 seconds:
// 1) It updates the price and order book data from the server,
// 2) It checks for existing orders, and adjusts bids if needed
// 3) It places new orders if none exist already

console2.log('\n' + "Timestamp: " + timestamp.timestamp() + '\n');
update_data().then(() => { maintenance() }).then(() => { new_orders() });

setInterval(() => {
    console2.log('\n' + "Timestamp: " + timestamp.timestamp() + '\n');
    update_data().then(
        () => { maintenance() }).then(
        () => { new_orders() });

},30000);




//////////////////////////////////////////////////////////////
/////////////////  Function Declarations   ///////////////////
//////////////////////////////////////////////////////////////

async function check_if_order_is_at_top(orderHash, ticker) {

    // Returns either a true or a false, depending on whether or not we're the top order

    var URL = "https://api.idex.market/returnOrderBook?count=" + order_book_depth + "&market=" + ticker; // Prep the URL
    var highest_hash; // Initialize

    var response = await axios.get(URL);

    highest_hash = response.data.bids[0].orderHash; // Highest bid's order hash
    console2.log("The highest order hash is: " + highest_hash);
    console2.log("And our order hash is: " + orderHash);


    if (highest_hash == orderHash) {
        return "true";
    } else {

        return "false";
    };

};

// Returns lowest ask and highest bid, as an array

function get_latest_bid_ask(data) {

    lowest_ask = data.asks[0].price; // Lowest ask
    highest_bid = data.bids[0].price; // Highest bid

};

// Gets the entire order book

async function get_order_book(ticker) {

    var URL = "https://api.idex.market/returnOrderBook?count=" + order_book_depth + "&market=" + ticker; // Prep the URL
    var response = await axios.get(URL);
    return response.data;

};

// Gets the trade history for a given market

async function get_trade_history(ticker) {

    var URL = "https://api.idex.market/returnTradeHistory?market=" + ticker; // Prep the URL
    var response = await axios.get(URL);
    last_order_price = response.data[0].price;
    console2.log(`The last order price is: ${last_order_price}`);
    return response.data;
};

// Gets the balances for a specific address

async function get_balances(address) {

    var URL = "https://api.idex.market/returnBalances?address=" + address; // Prep the URL
    var response = await axios.get(URL);
    my_balance_ETH = response.data.ETH;

    // Determine how many tokens in ETH and target token I have

    try {
        my_balance_tokens = response.data[target_token];
        if ( typeof my_balance_tokens !== 'undefined' && my_balance_tokens ) {
          my_balance_tokens = parseFloat(my_balance_tokens);
        } else {
          throw("Not valid value")
        }
    }
    catch(e) {
        console2.log("Error: You have none of this token in your balances.");
        my_balance_tokens = 0;
        response.data[target_token] = 0;
    }

    console2.log(`Current ${target_token} balance: ${my_balance_tokens} \nCurrent ETH balance: ${my_balance_ETH}`);
    return response.data;
};

// Locates orders belonging to your ETH address, from within a given order book

function find_my_orders_in_book(order_book) {
  
    // Currently just returns the first order found
    var first_ask_order_number = 0;
    var first_bid_order_number = 0;
    var volume_above_ask = 0;
    var volume_above_bid = 0;
    ask_count = 0;
    bid_count = 0;

    // Calculates the number of asks this address has in this book + first bid position
    for (var i = 0; i < order_book.asks.length; i++) {
      console.log("Starting loop " + i + " where the address is " + order_book.asks[i].params.user);
      if (address == order_book.asks[i].params.user) {

        if (first_ask_order_number == 0) { 
          first_ask_order_number = i;
          console.log ("first_ask_order_number is now " + first_ask_order_number);
        } else {
          console.log ("first_ask_order_number is " + first_ask_order_number)
        };
        ask_count++
      } else {
        console.log("The addresses didn't match");
      };
    };

    // Calculates the number of bids this address has in this book + first bid position
    for (var i = 0; i < order_book.bids.length; i++) {
      if (address == order_book.bids[i].params.user) {
        if (first_bid_order_number == 0) { 
          first_bid_order_number = i
        }
        bid_count++
      }
    };

    // Calculates the volume in ETH above the specified address

    for (var i = 0; i < first_ask_order_number; i++) {
        volume_above_ask += parseFloat(order_book.asks[i].total);
    };

    for (var i = 0; i < first_bid_order_number; i++) {
        volume_above_bid += parseFloat(order_book.bids[i].total);
    };

    // Calculate the ask price needed to stay above the next Wave
    // Calculate the ask price needed to stay above the next Wave

    var ask_price_needed_to_stay_above_Wave = 0;
    var bid_price_needed_to_stay_above_Wave = 0;
    var temp_ask_total = 0;
    var temp_bid_total = 0;

    for (var i = 0; i < order_book.asks.length; i++) {

        temp_ask_total += parseFloat(order_book.asks[i].total);

        if (temp_ask_total > average_wave_size) {
            ask_price_needed_to_stay_above_Wave = order_book.asks[i].price
            ask_price_needed_to_stay_above_Wave -= increment_amount;
            //            console.log(`The SELL price needed to stay in the Wave: ${ask_price_needed_to_stay_above_Wave}`);
            break;
        }

    };

    for (var i = 0; i < order_book.bids.length; i++) {

        temp_bid_total += parseFloat(order_book.bids[i].total);

        if (temp_bid_total > average_wave_size) {
            bid_price_needed_to_stay_above_Wave = parseFloat(order_book.bids[i].price);
            bid_price_needed_to_stay_above_Wave += increment_amount;
            //            console.log(`The BUY price needed to stay in the Wave: ${bid_price_needed_to_stay_above_Wave}`);
            break;
        }

    };

    // End "Next Wave Price" calculations



    myOrders = {
        asks: {
            count: ask_count,
            positionInBook: first_ask_order_number,
            orderAmount: parseFloat(order_book.asks[first_ask_order_number].amount),
            volumeAboveMe: volume_above_ask,
            priceAboveWave: parseFloat(ask_price_needed_to_stay_above_Wave),
            orderPrice: parseFloat(order_book.asks[first_ask_order_number].price)
        },
        bids: {
            count: bid_count,
            positionInBook: first_bid_order_number,
            orderAmount: parseFloat(order_book.bids[first_bid_order_number].amount),
            volumeAboveMe: volume_above_bid,
            priceAboveWave: parseFloat(bid_price_needed_to_stay_above_Wave),
            orderPrice: parseFloat(order_book.bids[first_ask_order_number].price)

        },
    };

    return myOrders;
};

// Updates all data - order books, trade history, balances, etc.

async function update_data() {

    order_book = await get_order_book(target_pair);
    my_order_data = await find_my_orders_in_book(order_book);
    console.log(order_book);
    console.log(my_order_data);
    await get_latest_bid_ask(order_book);
    //    await console.log("Order book loaded");
    trade_history = await get_trade_history(target_pair);
    //    await console.log("Trade history loaded")
    balances = await get_balances(address);
    await console2.log("Data updated!")
};

// Follows the maintenance decision tree on the sell order side.
// Checks for: If orders exist, if orders need to be bumped higher, if a stop loss has been hit

async function maintenance_check_sell_orders() {
    if (myOrders.asks.count != 0) { // If I have at least 1 order on the books
        if (((my_balance_tokens + parseFloat(myOrders.asks.orderAmount)) * last_order_price) > 0.15) { // If I have at least 0.15 ETH worth of tokens
            if (last_order_price > stoploss) { // If the price is higher than the stop loss
                if (parseFloat(myOrders.asks.volumeAboveMe) > average_wave_size) {
                    console2.log(`There is ${myOrders.asks.volumeAboveMe} in ETH above me, which is greater than the Wave size of ${average_wave_size}. Rebuying. Note: rebuy not yet coded`);

                    hash_to_cancel = fs.readFileSync('order_hash_ask.json', "utf8");
                    await idex.cancel_order(hash_to_cancel);
                    var input_ETH_amount = ((my_balance_tokens.toFixed(4) - 0.0001) + myOrders.asks.orderAmount) * myOrders.asks.priceAboveWave; // Input the amount in ETH to sell
                    console2.log("input_ETH_amount is: " + input_ETH_amount);

                    await setTimeout(() => {
                        idex.execute_sell_order(myOrders.asks.priceAboveWave, input_ETH_amount, target_contract, precision); 

                    },2000);

                }

                else {
                    console2.log(`I have a SELL ORDER for ${myOrders.asks.orderAmount} tokens at ${myOrders.asks.orderPrice} with ${myOrders.asks.volumeAboveMe} in ETH above me. No action needed.`);
                };

            }

            else {
                console2.log(`The price is below stoploss. I should cancel and rebuy - No action for now.`);
            };

        }
        else {
            console2.log(`I don't have enough tokens to process a sell order.`);
            //            console.log(`I have ${my_balance_tokens} in my account and ${myOrders.asks.orderAmount} in orders.` + (my_balance_tokens + parseFloat(myOrders.asks.orderAmount)) * last_order_price);

        };
    }
    else {
        console2.log(`I don't have any sell orders on the order book.`);
    };
};

// Follows the maintenance decision tree on the buy order side.
// Checks for: If orders exist, if orders need to be bumped higher, if a stop loss has been hit

async function maintenance_check_buy_orders() {

    if (myOrders.bids.count != 0) { // If I have at least 1 order on the books
        if (myOrders.bids.volumeAboveMe > average_wave_size) { // If I have at least 0.15 ETH worth of tokens
            console2.log(`There is ${myOrders.bids.volumeAboveMe} in ETH above me, which is greater than the Wave size of ${average_wave_size}. Rebuying. Note: rebuy not yet coded`);

            hash_to_cancel = fs.readFileSync('order_hash_bid.json', "utf8");
            await idex.cancel_order(hash_to_cancel);
            await get_balances(address);

            var input_ETH_amount = parseFloat(my_balance_ETH);
            input_ETH_amount = input_ETH_amount.toFixed(4) - 0.0001;
            await idex.execute_buy_order(myOrders.bids.priceAboveWave, input_ETH_amount, target_contract, precision);

        }
        else {
            console2.log(`There is a BUY ORDER for ${myOrders.bids.orderAmount} tokens at ${myOrders.bids.orderPrice} with ${myOrders.bids.volumeAboveMe} in ETH above me. No action needed.`);
        };
    }
    else {
        console2.log(`I don't have any buy orders on the order book.`);
    };
};

async function maintenance() {

    await maintenance_check_sell_orders();
    await maintenance_check_buy_orders();
    return;

};

// Follows the new order decision tree on the buy side.

async function new_buy_orders() {

    if (myOrders.bids.count == 0) { // If I have no current buy orders
        if ((my_balance_ETH > 0.15)) { // If I have at least 0.15 ETH
            if (last_order_price > stoploss) { // If the price is higher than the stop loss

                console2.log(`Placing a new buy order`);
                var input_ETH_amount = parseFloat(my_balance_ETH);
                input_ETH_amount = input_ETH_amount.toFixed(4) - 0.0001;
                idex.execute_buy_order(myOrders.bids.priceAboveWave, input_ETH_amount, target_contract, precision);

            }

            else {
                console2.log(`The price is below stoploss. No new orders for now.`);
            };

        }
        else {
            console2.log(`I don't have enough ETH to process a new buy order.`);
        };
    }
    else {
        console2.log(`I already have a buy order on the books.`);
    };
};

// Follows the new order decision tree on the sell side

async function new_sell_orders() {

    if (myOrders.asks.count == 0) { // If I have no current buy orders
        if ((my_balance_tokens * last_order_price > 0.15)) { // If I have at least 0.15 ETH
            if (last_order_price > stoploss) { // If the price is higher than the stop loss

                console2.log(`Placing a new sell order for ${my_balance_tokens.toFixed(4)} tokens at ${myOrders.asks.priceAboveWave} price.`);

                var input_ETH_amount = (my_balance_tokens.toFixed(4) - 0.0001) * myOrders.asks.priceAboveWave; // Input the amount in ETH to sell

                idex.execute_sell_order(myOrders.asks.priceAboveWave, input_ETH_amount, target_contract, precision);

            }

            else {
                console2.log(`The price is below stoploss. Placing emergency sell order.`);
            };

        }
        else {
            console2.log(`I don't have enough tokens to process a new sell order.`);
        };
    }
    else {
        console2.log(`I already have a sell order on the books.`);
    };
};

async function new_orders() {
    await new_buy_orders();
    await new_sell_orders();

};

