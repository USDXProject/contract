const MintableToken = artifacts.require('TestMintableToken.sol');
const BigNumber = web3.BigNumber;
const utils = require('./helpers/Utils');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const expect = require('chai').expect;

contract('Mintable', function (accounts) {
  let token;

  beforeEach(async function () {
    token = await MintableToken.new();
  });

  it('should start with a totalSupply of 0', async function () {
    let totalSupply = await token.totalSupply();

    assert.equal(totalSupply, 0);
  });

  it('should mint a given amount of tokens to a given address', async function () {
    const result = await token.mint(accounts[0], 100);

    let mintEvent = result.logs.find(e => e.event === 'Mint');
    expect(mintEvent).to.exist;
    mintEvent.args.to.should.equal(accounts[0]);
    mintEvent.args.amount.should.be.bignumber.equal(100);

    let transferEvent = result.logs.find(e => e.event === 'Transfer');
    expect(transferEvent).to.exist;

    // A roundabout way to test from address is 0x0. Without this, the test
    // attemps a string match to compare string
    // '0x0000000000000000000000000000000000000000' to number 0x0.
    parseInt(transferEvent.args._from).should.equal(0);
    transferEvent.args._to.should.equal(accounts[0]);
    transferEvent.args._value.should.be.bignumber.equal(100);

    let balance0 = await token.balanceOf(accounts[0]);
    assert(balance0, 100);

    let totalSupply = await token.totalSupply();
    assert(totalSupply, 100);
  });
});
