const TestBurnableToken = artifacts.require('TestBurnableToken.sol');
const BigNumber = web3.BigNumber;
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

  it('owner should be able to burn tokens', async function () {
    const { logs } = await token.burn(1, { from: accounts[0] });

    const balance = await token.balanceOf(accounts[0]);
    balance.should.be.bignumber.equal(expectedTokenSupply);

    const totalSupply = await token.totalSupply();
    totalSupply.should.be.bignumber.equal(expectedTokenSupply);

    const event = logs.find(e => e.event === 'Burn');
    expect(event).to.exist;
  });

  it('cannot burn more tokens than your balance', async function () {
     try {
         await token.burn(2000, { from: accounts[0] });
         assert(false, "didn't throw");
     } catch (error) {
         return utils.ensureException(error);
     }
  });
});
