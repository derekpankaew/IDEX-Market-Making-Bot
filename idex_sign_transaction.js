///////////////////////////////
///////  Description   ////////
///////////////////////////////

/*

This file defines utility functions for interacting with IDEX's servers.
Specifically, it exports 3 functions:
1. Execute buy order,
2. Execute sell order,
3. Cancel existing order

IDEX is a decentralized exchange, so interacting with the API requires
using private key signing and transaction hashing. These functions
abstract that complexity, so the_brain.js can focus on trading.

*/

///////////////////////////////
///////  Constants   //////////
///////////////////////////////

const console2 = require("./includes/console2.js");
const fs = require('fs');
const Big = require('big.js');
const settings = JSON.parse(fs.readFileSync('settings.json', "utf8"));
const idex = require('./idex_sign_transaction.js')
const timestamp = require('./includes/timestamp.js')
const request = require('request');
const { soliditySha3 } = require('web3-utils');
const {
    hashPersonalMessage,
    bufferToHex,
    toBuffer,
    ecsign
} = require('ethereumjs-util');
const { mapValues } = require('lodash');
const expires = "100000";


///////////////////////////////
////////  SETTINGS   //////////
///////////////////////////////

const address = settings.myAddress; // My wallet address
const privateKey = settings.privateKey; // Private Key
const privateKeyBuffer = Buffer.from(privateKey, 'hex');
const contractAddress = settings.IDEXcontractAddress; // Standard IDEX contract address

///////////////////////////////
///////////////////////////////
///////////////////////////////


function execute_buy_order(tokenPrice, howMuchInETH, tokenBuy, sellPrecision) {
  
    console2.log("execute_buy_order Inputs: ");
    console2.log([tokenPrice, howMuchInETH, tokenBuy, sellPrecision]);
    return false;

    var amountBuy = calculate_amount_buy(tokenPrice, howMuchInETH, sellPrecision);
    var tokenSell = "0x0000000000000000000000000000000000000000"; // Default address for ETH
    var amountSell = howMuchInETH * Math.pow(10, 18);
    amountSell = amountSell.toString();

    var nonce = get_and_add_nonce();

    var hashed_values = hash_and_sign(contractAddress,tokenBuy,amountBuy,tokenSell,amountSell,expires,nonce,address);

    send_the_transaction(tokenBuy,amountBuy,tokenSell,amountSell,address,nonce,expires,hashed_values.v,hashed_values.r,hashed_values.s,"bid");

};

function execute_sell_order(tokenPrice, howMuchInETH, tokenSell, sellPrecision) {

    console2.log("execute_sell_order Inputs: ");
    console2.log([tokenPrice, howMuchInETH, tokenSell, sellPrecision]);
    return false;

    var amountSell = calculate_amount_buy(tokenPrice, howMuchInETH, sellPrecision);
    var tokenBuy = "0x0000000000000000000000000000000000000000"; // Default address for ETH
    var amountBuy = howMuchInETH * Math.pow(10, 18);
    amountBuy = amountBuy.toString();

    var nonce = get_and_add_nonce();

    var hashed_values = hash_and_sign(contractAddress,tokenBuy,amountBuy,tokenSell,amountSell,expires,nonce,address);

    send_the_transaction(tokenBuy,amountBuy,tokenSell,amountSell,address,nonce,expires,hashed_values.v,hashed_values.r,hashed_values.s,"ask");


};

// Takes all the transaction data as parameters
// formats it into JSON, hashes and signs it, and sends it to IDEX servers

function send_the_transaction(tokenBuy,amountBuy,tokenSell,amountSell,address,nonce,expires,v,r,s,type) {
    console2.log("send_the_transaction inputs:")
    console2.log(tokenBuy,amountBuy,tokenSell,amountSell,address,nonce,expires,v,r,s,type);
    return false;
    
    if (type == "bid") {
        var file = 'order_hash_bid.json'
        }
    else if (type == "ask") {
        var file = 'order_hash_ask.json'
        }
    else {
        console2.log("Error: transaction type is neither bid nor ask")
    }


    console2.log("Data being sent: ");
    console2.log("tokenBuy: " + tokenBuy);
    console2.log("amountBuy: " + amountBuy);
    console2.log("tokenSell: " + tokenSell);
    console2.log("amountSell: " + amountSell);
    console2.log("address: " + address);



    request({
        method: 'POST',
        url: 'https://api.idex.market/order',
        json: {
            tokenBuy: tokenBuy,
            amountBuy: amountBuy,
            tokenSell: tokenSell,
            amountSell: amountSell,
            address: address,
            nonce: nonce,
            expires: expires,
            v: v,
            r: r,
            s: s
        }

    }, function (err, resp, body) {
        console2.log(body);
        if (body.orderHash != undefined) {
            fs.writeFileSync(file, body.orderHash, "utf8");
            console2.log("Saved hash: " + body.orderHash);
            console2.log("Time: " + timestamp.timestamp());
        }
        else {
            console2.log("Hash is undefined, not saved to hash file.")
        };


    })

}

// Uses private key to hash and sign the transaction

function hash_and_sign(contractAddress, tokenBuy, amountBuy, tokenSell, amountSell, expires, nonce, address) {

    const raw = soliditySha3({
        t: 'address',
        v: contractAddress
    }, {
        t: 'address',
        v: tokenBuy
    }, {
        t: 'uint256',
        v: amountBuy
    }, {
        t: 'address',
        v: tokenSell
    }, {
        t: 'uint256',
        v: amountSell
    }, {
        t: 'uint256',
        v: expires
    }, {
        t: 'uint256',
        v: nonce
    }, {
        t: 'address',
        v: address
    });
    const salted = hashPersonalMessage(toBuffer(raw))
    const {
        v,
        r,
        s
    } = mapValues(ecsign(salted, privateKeyBuffer), (value, key) => key === 'v' ? value : bufferToHex(value));

    return {v, r, s};


};

async function cancel_order(orderHash) {

    var address = settings.myAddress; // My wallet address
    var nonce = get_and_add_nonce();
    var privateKeyBuffer = Buffer.from(privateKey, 'hex');


    console2.log(orderHash);

    const { soliditySha3 } = require('web3-utils');
    var request = require('request');

    const {
        hashPersonalMessage,
        bufferToHex,
        toBuffer,
        ecsign
    } = require('ethereumjs-util');

    const { mapValues } = require('lodash');
    const raw = soliditySha3({
        t: 'uint256',
        v: orderHash
    }, {
        t: 'uint256',
        v: nonce
    });
    const salted = hashPersonalMessage(toBuffer(raw))
    const {
        v,
        r,
        s
    } = mapValues(ecsign(salted, privateKeyBuffer), (value, key) => key === 'v' ? value : bufferToHex(value));

    v_string = v.toString();

    console2.log(v);
    console2.log(r);
    console2.log(s);


    request({
        method: 'POST',
        url: 'https://api.idex.market/cancel',
        json: {
            orderHash: orderHash,
            nonce: nonce,
            address: address,
            v: v,
            r: r,
            s: s
        }

    }, function (err, resp, body) {
        console2.log(body);
    })

};

// Nonce is a number which increases by 1 in each transcation
// This prevers re-use of a signed transaction. In other words, every transaction
// will have a different signature because at least 1 part of the data is different
// each time.

function get_and_add_nonce() {

    var current_nonce = fs.readFileSync('nonce.json', "utf8");

    console2.log("Starting nonce is: " + current_nonce);

    current_nonce++;
    current_nonce++;

    fs.writeFileSync('nonce.json', current_nonce, "utf8");

    var string_nonce = current_nonce - 1;
    string_nonce = string_nonce.toString();

    return string_nonce;

};

// Allows you to input the amount you want to buy in ETH, and get back
// the amount of tokens you want to buy. Lets us standardize our buy
// orders by expressing it in ETH rather than the token we're buying.

function calculate_amount_buy (tokenPrice, howMuchInETH, sellPrecision) {

    var sellPrecisionMultiplier = Big(10).pow(sellPrecision);

    console2.log("Input functions: " + howMuchInETH + " and " + tokenPrice);

    var amountSell = Big(howMuchInETH).div(tokenPrice);

    amountSell = Big(amountSell).times(sellPrecisionMultiplier);

    amountSell = amountSell.toFixed(0);

    amountSell = amountSell.toString();

    return amountSell;
}

module.exports = {
    execute_buy_order,
    cancel_order,
    execute_sell_order
};