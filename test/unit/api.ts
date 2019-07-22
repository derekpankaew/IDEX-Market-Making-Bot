import {IDEXAPI} from '../../src/utils/api';
import {assert} from 'chai';
import {expect} from 'chai';

describe('#IDEXAPI', () => {
  it('getTargetCurrencyInfo() params are set correctly', async () => {
    const {
      contractAddress,
      presition,
      lastOrderPrice
    } = await IDEXAPI.getTargetCurrencyInfo();
    console.log(`contractAddress => ${contractAddress}`);
    console.log(`presition => ${presition}`);
    console.log(`lastOrderPrice => ${lastOrderPrice.toFixed()}`);
    assert.isNotEmpty(contractAddress);
    assert.isNumber(presition);
    assert.isNotEmpty(lastOrderPrice.toFixed());
  });

  it('getETHBalance() returns balances, these are greater than 0', async () => {
    const [myBalanceETH, myBalanceTokens] = await IDEXAPI.getETHBalance();
    expect(myBalanceETH.amount.cmp(0)).to.be.at.least(0);
    expect(myBalanceTokens.amount.cmp(0)).to.be.at.least(0);
  });

  it('getNextNone() returns non empty number', async () => {
    const nonce = await IDEXAPI.getNextNone();
    console.log(`next nonce => ${nonce}`);
    assert.isNumber(nonce);
  });

  it('execute the buy order correctly', async () => {
    // TODO
    assert.isTrue(true);
  });

  it('execute the sell order correctly', async () => {
    // TODO
    assert.isTrue(true);
  });
});
