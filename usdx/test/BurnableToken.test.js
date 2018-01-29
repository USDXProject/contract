const TestBurnableToken = artifacts.require('TestBurnableToken.sol');
const BigNumber = web3.BigNumber;
const EventVerifier = require('./helpers/EventVerifier');
const utils = require('./helpers/Utils');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const expect = require('chai').expect;

contract('BurnableToken', function (accounts) {
  let token;
  let expectedTokenSupply = new BigNumber(999);

  beforeEach(async function () {
    token = await TestBurnableToken.new(accounts[0], 1000);
  });

  it('owner should be able to burn tokens for themselves', async function () {
    const result = await token.burn(1, { from: accounts[0] });
    EventVerifier.burnEvent(result, accounts[0], 1);

    const balance = await token.balanceOf(accounts[0]);
    balance.should.be.bignumber.equal(expectedTokenSupply);

    const totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(expectedTokenSupply);
  });

  it('owner should be able to burn tokens for another address', async function () {
    await token.transfer(accounts[1], 300, { from: accounts[0] });

    // Verify that the two accounts should have the right balance.
    let balance0 = await token.balanceOf(accounts[0]);
    balance0.should.be.bignumber.equal(700);

    let balance1 = await token.balanceOf(accounts[1]);
    balance1.should.be.bignumber.equal(300);

    // Burn token in account 1 from account 0.
    const result = await token.burnForAddress(accounts[1], 100, { from: accounts[0] });
    EventVerifier.burnEvent(result, accounts[1], 100);

    // Verify token in account 1 is successfully burnt.
    balance1 = await token.balanceOf(accounts[1]);
    balance1.should.be.bignumber.equal(200);

    // Verify that total supply is reduced accordingly.
    const totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(900);
  });

  it('non-owner should not be able to burn tokens for any address', async function () {
    await token.transfer(accounts[1], 300, { from: accounts[0] });

    // Verify that the two accounts should have the right balance.
    let balance0 = await token.balanceOf(accounts[0]);
    balance0.should.be.bignumber.equal(700);

    let balance1 = await token.balanceOf(accounts[1]);
    balance1.should.be.bignumber.equal(300);

    // Verify that account 1 can't burn token for itself and the operation is
    // reverted.
    await token.burn(100, { from: accounts[1] })
      .should.be.rejectedWith(utils.revert);

    // Verify that account 1 can't burn token for another account and the
    // operation is reverted.
    await token.burnForAddress(accounts[0], 100, { from: accounts[1] })
      .should.be.rejectedWith(utils.revert);

    // Verify balance in account 0 is intact.
    balance1 = await token.balanceOf(accounts[0]);
    balance1.should.be.bignumber.equal(700);

    // Verify balance in account 1 is intact.
    balance1 = await token.balanceOf(accounts[1]);
    balance1.should.be.bignumber.equal(300);

    // Verify that total supply is intact.
    const totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(1000);
  });

  it('cannot burn more tokens than balance', async function () {
    // Verify that burning more token than balance is reverted.
    await token.burn(2000, { from: accounts[0] })
      .should.be.rejectedWith(utils.revert);

    // Verify balance in account 0 is intact.
    let balance1 = await token.balanceOf(accounts[0]);
    balance1.should.be.bignumber.equal(1000);

    // Verify that total supply is intact.
    const totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(1000);
  });
});
