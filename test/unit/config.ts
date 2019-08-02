import {config} from '../../src/config';
import {assert} from 'chai';

describe('Settings are properly set', () => {
  it('#targetPair is string', () => {
    assert.typeOf(config.targetPair, 'string');
  });
  it('#stoploss is number', () => {
    assert.typeOf(config.stoploss, 'number');
  });
  it('#averageWaveSize is number', () => {
    assert.typeOf(config.averageWaveSize, 'number');
  });
  it('#address is string', () => {
    console.log(`ETH address: ${config.address}`);
    assert.typeOf(config.address, 'string');
  });
  it('#incrementAmount is object(Big)', () => {
    assert.typeOf(config.incrementAmount, 'object');
  });
  it('#targetToken is string', () => {
    console.log(`Target Token: ${config.targetToken}`);
    assert.typeOf(config.targetToken, 'string');
  });
  it('#privateKey is string', () => {
    assert.typeOf(config.privateKey, 'string');
  });
  it('#dryRun is boolean', () => {
    assert.typeOf(config.dryRun, 'boolean');
    assert.isTrue(config.dryRun);
  });
});
