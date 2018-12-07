# Overview

This is a market making bot for IDEX. It's built in NodeJS, and runs from the command line. You can run it from any linux distro.

This bot was profitable for 2-3 weeks, and then not profitable after that. I enjoyed building it, but lost interest in continuing to refine it, so I decided to open source it instead.

# Disclaimer

USE AT YOUR OWN RISK - THIS BOT SOMETIMES MAKES MONEY, AND SOMETIMES LOSES MONEY. YOU ARE 100% RESPONSIBLE FOR YOUR OWN DECISIONS AND ACTIONS. THIS CODE IS PRESENTED AS IS, WITH NO WARRANTIES WHATSOEVER.

# How it Works

The bot works like this:

- It takes the "average wave size" as a parameter (see below.)
- It sets your bid at just above the avg wave size, on the buy side, or the reverse on the sell side.
- If it successfully buys, it immediately creates an order on the sell side.
- It repeats until you kill the script.

# Average Wave Size

The idea behind the average wave size is to place buy orders just below the size of an average order. This way, if a large-ish buy order is placed, it will hit all the orders above us and our order. This gives us a better price than staying at the top of the order book, while still letting our order get filled.

For example, let's say the order book looks like this:

0.00045, 1 ETH
0.00044, 1 ETH
0.00043, 1 ETH
0.00042, 1 ETH
0.00041.00001, 1 ETH <-- Our buy order
0.00041, 1.5 ETH

If you input an average wave size of 5 ETH, if will see that the .00041 bid will put the order book above 5 ETH. In other words, we want an order to be filled if a 5 ETH sell order hits, so the bot automatically calculates where in the order book it needs to sit to have that order fulfilled.

# Setup

## nonce.json

Nonce must be set to a number higher than the one on your account. Check your account's nonce at:

https://api.idex.market/returnNextNonce?address=

## settings.json

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

# Feedback

If you have feedback, feel free to email me at derekpankaew@gmail.com. If you make improvements, or if it makes money for you, I'd love to hear from you.

Once again, this software is provided as-is with no warrantees, guarantees, or responsibility on my part whatsoever. Best of luck.
