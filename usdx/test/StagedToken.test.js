const StagedToken = artifacts.require('TestStagedToken.sol');
const BigNumber = web3.BigNumber;
const EventVerifier = require('./helpers/EventVerifier');
const utils = require('./helpers/Utils');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('StagedToken', function (accounts) {
  let token;

  beforeEach(async function () {
    token = await StagedToken.new(5000);
  });

  it('should record address of message sender', async function () {
    let totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(5000);

    let balance = await token.balanceOf(accounts[0]);
    totalSupply.should.be.bignumber.equal(5000);

    let sender = await token.stagedTokenAddresses(0);
    sender.should.equal(accounts[0]);
  });

  it('should record address after transfer', async function () {
    await token.transfer(accounts[1], 1000);
    let receiver = await token.stagedTokenAddresses(1);
    receiver.should.equal(accounts[1]);

    let totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(5000);

    let balance = await token.balanceOf(accounts[0]);
    balance.should.be.bignumber.equal(4000);

    balance = await token.balanceOf(accounts[1]);
    balance.should.be.bignumber.equal(1000);
  });

  it('should record address after mint', async function () {
    await token.mint(accounts[2], 2000);
    let receiver = await token.stagedTokenAddresses(1);
    receiver.should.equal(accounts[2]);

    let totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(7000);

    let balance = await token.balanceOf(accounts[0]);
    balance.should.be.bignumber.equal(5000);

    balance = await token.balanceOf(accounts[1]);
    balance.should.be.bignumber.equal(0);

    balance = await token.balanceOf(accounts[2]);
    balance.should.be.bignumber.equal(2000);
  });
});
