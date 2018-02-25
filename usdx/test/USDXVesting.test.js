const USDXVesting = artifacts.require('USDXVesting.sol');
const USDXToken = artifacts.require('USDXToken.sol');
const Utils = require('./helpers/Utils')
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('TokenVesting', function (accounts) {
  const amount = new BigNumber(1000);
  const owner = accounts[0];
  const beneficiary = accounts[1];

  let token = null;
  let vesting = null;

  let start;
  const cliff = Utils.duration.years(1);
  const duration = Utils.duration.years(2);

  beforeEach(async function () {
    start = Utils.latestTime() + Utils.duration.minutes(1); // +1 minute so it starts after contract instantiation
    token = await USDXToken.new('USDX', 'USDX', 0);
    vesting = await USDXVesting.new(token.address, beneficiary, start, cliff, duration, true, { from: owner });

    // Initialize the vesting contract with some USDXTokens.
    await token.mint(vesting.address, amount, { from: owner });
  });

  it('cannot be released before cliff', async function () {
    await vesting.release().should.be.rejectedWith(Utils.revert);
  });

  it('can be released after cliff', async function () {
    await Utils.increaseTimeTo(start + cliff + Utils.duration.weeks(1));
    await vesting.release().should.be.fulfilled;
  });

  it('should release proper amount after cliff', async function () {
    await Utils.increaseTimeTo(start + cliff);

    // Verify that the balance is 0 before releasing.
    let balance = await token.balanceOf(beneficiary);
    balance.should.bignumber.equal(0);

    const { receipt } = await vesting.release();
    const releaseTime = web3.eth.getBlock(receipt.blockNumber).timestamp;

    // Verify that the balance should reflect what is released.
    balance = await token.balanceOf(beneficiary);
    balance.should.bignumber.equal(amount.mul(releaseTime - start).div(duration).floor());
  });

  it('should linearly release tokens during vesting period', async function () {
    const vestingPeriod = duration - cliff;
    const checkpoints = 4;

    for (let i = 1; i <= checkpoints; i++) {
      const now = start + cliff + i * (vestingPeriod / checkpoints);
      await Utils.increaseTimeTo(now);

      await vesting.release();
      const balance = await token.balanceOf(beneficiary);
      const expectedVesting = amount.mul(now - start).div(duration).floor();

      balance.should.bignumber.equal(expectedVesting);
    }
  });

  it('should have released all after end', async function () {
    await Utils.increaseTimeTo(start + duration);
    await vesting.release();
    const balance = await token.balanceOf(beneficiary);
    balance.should.bignumber.equal(amount);
  });

  it('should be revoked by owner if revocable is set', async function () {
    await vesting.revoke({ from: owner }).should.be.fulfilled;
  });

  it('should fail to be revoked by owner if revocable not set', async function () {
    const vesting2 = await USDXVesting.new(token.address, beneficiary, start, cliff, duration, false, { from: owner });
    await vesting2.revoke({ from: owner }).should.be.rejectedWith(Utils.revert);
  });

  it('should return the non-vested tokens when revoked by owner', async function () {
    await Utils.increaseTimeTo(start + cliff + Utils.duration.weeks(12));
    const vested = await vesting.vestedAmount();
    await vesting.revoke({ from: owner });
    const ownerBalance = await token.balanceOf(owner);
    ownerBalance.should.bignumber.equal(amount.sub(vested));
  });

  it('should keep the vested tokens when revoked by owner', async function () {
    await Utils.increaseTimeTo(start + cliff + Utils.duration.weeks(12));
    const vestedPre = await vesting.vestedAmount();
    await vesting.revoke({ from: owner });
    const vestedPost = await vesting.vestedAmount();
    vestedPre.should.bignumber.equal(vestedPost);
  });

  it('should fail to be revoked a second time', async function () {
    await Utils.increaseTimeTo(start + cliff + Utils.duration.weeks(12));
    await vesting.vestedAmount();
    await vesting.revoke({ from: owner });
    await vesting.revoke({ from: owner }).should.be.rejectedWith(Utils.revert);
  });
});
