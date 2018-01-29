const MintableToken = artifacts.require('TestMintableToken.sol');
const BigNumber = web3.BigNumber;
const EventVerifier = require('./helpers/EventVerifier');
const utils = require('./helpers/Utils');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('Mintable', function (accounts) {
  let token;

  beforeEach(async function () {
    token = await MintableToken.new();
  });

  it('should start with a totalSupply of 0', async function () {
    let totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(0);
  });

  it('should mint a given amount of tokens to a given address', async function () {
    const result = await token.mint(accounts[0], 100);

    // Verify that both MintEvent and TransferEvent are emitted.
    EventVerifier.mintEvent(result, accounts[0], 100);
    EventVerifier.transferEvent(result, 0x0, accounts[0], 100);

    let balance0 = await token.balanceOf(accounts[0]);
    balance0.should.be.bignumber.equal(100);

    let totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(100);
  });
});
