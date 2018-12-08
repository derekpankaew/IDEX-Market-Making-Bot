# Overview

This is a market making bot for IDEX. It's built in NodeJS, and runs from the command line. You can run it from any linux distribution.

This bot was somewhat profitable in flat markets, and then not profitable during and after the crash. I enjoyed building it, so I decided to open source it instead of shutting it down.

# How it Works

The bot uses a tree of if-then statements to determine whether it should buy or sell. The tree is as follows:

![Decision tree of how the bot works](/node_modules/decision-tree.jpg?raw=true "Decision Tree")

# Overall Strategy Description

The bot works like this:

- It takes the "average wave size" as a parameter (see below.)
- It sets your bid at just above the avg wave size, on the buy side, or just under the wave size on the sell side.
- If it successfully buys, it immediately creates an order on the sell side.
- You can set the minimum expected spread the bot needs to trade.
- It repeats until you kill the script.

# Average Wave Size

We can maximize our spread by **not** staying at the top of the order book. 

We place orders that are slightly smaller than the average order. This way, if a buy (or sell) order is placed, it will hit all the orders above us, plus our order. This gives us a better price than staying at the top of the order book, while still letting our order get filled.

For example, let's say the order book looks like this:
```
0.00045, 1 ETH
0.00044, 1 ETH
0.00043, 1 ETH
0.00042, 1 ETH
0.0004100001, 1 ETH <-- Our buy order
0.00041, 1.5 ETH
```

If a trader comes along and places a 5 ETH order, it will still hit our order. We're getting a 9% better price than the person at the top of the order book, giving us a much better spread.

You can set the average wave size for each market, based on how large orders in that market tends to be. The bot will automatically calculate where on the order book it needs to sit to be within the average wave (buy / sell) size.

# Key Files

There are three key files to this bot:

1. idex_sign_transaction.js - This manages all the transaction related code. Since IDEX is a decentralized exchange, all transactions need to be hashed and signed with a private key. The functions exported here handle all of that complexity.

2. the_brain.js - This handles the primary trading logic. It also handles gathering data from the server, to make trading decisions.

3. settings.json - This is where you add the settings needed to operate the bot. See below.

# Setting Up the Bot

## nonce.json

Nonce must be set to a number higher than the one on your account. Check your account's nonce at:

https://api.idex.market/returnNextNonce?address=

## Configuring Your Settings

To setup the bot, input your information as follows in settings.json:

    "myAddress": Your address
    "privateKey": Your private key
    "target_contract": The address of the contract you wish to trade (ETH hash, starting with 0x)
    "target_pair": The pair you wish to trade, in string - "ETH_ZCN" for example
    "target_token": "ZCN", -- The latter half of the above
    "precision": 10, -- You can get this from https://api.idex.market/returnCurrencies
    "stoploss": The level at which you stop buying
    "average_wave_size": See above
    "increment_amount": By how much you wish to increment to stay above or below a bid
    "IDEXcontractAddress": "0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208"

# Running the Bot

To run the bot, just type:

`node the_brain.js`

This will start the script running using the settings you specified.

# Feedback

If you have feedback, feel free to email me at derekpankaew@gmail.com. If you make improvements, or if it makes money for you, I'd love to hear from you.

Once again, this software is provided as-is with no warrantees, guarantees, or responsibility on my part whatsoever. Best of luck.

# Disclaimer

USE AT YOUR OWN RISK - THIS BOT SOMETIMES MAKES MONEY, AND SOMETIMES LOSES MONEY. YOU ARE 100% RESPONSIBLE FOR YOUR OWN DECISIONS AND ACTIONS. THIS CODE IS PRESENTED AS IS, WITH NO WARRANTIES WHATSOEVER.

IDEX is a decentralized server and requires a private key for trading. Obviously, storing a private key on a node server has its own risks, and managing that security is up to you. I'd recommend using this as a starting point to customize your own code and strategies. As always, never run code you don't fully understand.