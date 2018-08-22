Nonce must be set to a number higher than the one on your account. Check your account's nonce at:

https://api.idex.market/returnNextNonce?address=

Bot Setup

To setup the bot, input your information as follows in settings.json:

    "myAddress": Your address
    "privateKey": Your private key
    "target_contract": The address of the contract you wish to trade (ETH hash, starting with 0x)
    "target_pair": The pair you wish to trade, in string - "ETH_ZCN" for example
    "target_token": "ZCN", -- The latter half of the above
    "precision": 10, -- You can get this from https://api.idex.market/returnCurrencies
    "stoploss": The level at which you stop buying
    "average_wave_size": See below
    "increment_amount": By how much you wish to increment to stay above or below a bid
    "IDEXcontractAddress": "0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208"

Average Wave Size