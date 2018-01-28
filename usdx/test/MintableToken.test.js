const MintableToken = artifacts.require('TestMintableToken.sol');

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
    assert.equal(result.logs[0].event, 'Mint');
    assert.equal(result.logs[0].args.to.valueOf(), accounts[0]);
    assert.equal(result.logs[0].args.amount.valueOf(), 100);
    assert.equal(result.logs[1].event, 'Transfer');
    assert.equal(result.logs[1].args._from.valueOf(), 0x0);
    assert.equal(result.logs[1].args._to.valueOf(), accounts[0]);
    assert.equal(result.logs[1].args._value.valueOf(), 100);

    let balance0 = await token.balanceOf(accounts[0]);
    assert(balance0, 100);

    let totalSupply = await token.totalSupply();
    assert(totalSupply, 100);
  });
});
