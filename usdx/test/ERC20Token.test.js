/* global artifacts, contract, it, assert */
/* eslint-disable prefer-reflect */
const TestERC20Token = artifacts.require('TestERC20Token.sol');
const BigNumber = web3.BigNumber;
const utils = require('./helpers/Utils');
const expect = require('chai').expect;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const invalidAccount = '0x0';

let token;

contract('ERC20Token', (accounts) => {
    beforeEach(async function () {
        token = await TestERC20Token.new();
    });
    it('verifies the token name after construction', async () => {
        let name = await token.name.call();
        assert.equal(name, 'TestERC20');
    });

    it('verifies the token symbol after construction', async () => {
        let symbol = await token.symbol.call();
        assert.equal(symbol, 'TERC');
    });

    it('verifies the balances after a transfer', async () => {
        const result = await token.transfer(accounts[1], 500);
        let balance;
        balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, 1500);
        balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 500);

        let transferEvent = result.logs.find(e => e.event === 'Transfer');
        expect(transferEvent).to.exist;
        transferEvent.args._from.should.equal(accounts[0]);
        transferEvent.args._to.should.equal(accounts[1]);
        transferEvent.args._value.should.be.bignumber.equal(500);
    });

    it('verifies that a transfer fires a Transfer event', async () => {
        let res = await token.transfer(accounts[1], 500);
        assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
    });

    it('should throw when attempting to transfer more than the balance', async () => {
        try {
            await token.transfer(accounts[1], 5000);
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('should throw when attempting to transfer to an invalid address', async () => {
        try {
            await token.transfer(invalidAccount, 10);
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies the allowance after an approval', async () => {
        await token.approve(accounts[1], 500);
        let allowance = await token.allowance.call(accounts[0], accounts[1]);
        assert.equal(allowance, 500);
    });

    it('verifies that an approval fires an Approval event', async () => {
        let res = await token.approve(accounts[1], 500);
        assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
    });

    it('should throw when attempting to define allowance for an invalid address', async () => {
        try {
            await token.approve(invalidAccount, 10);
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('verifies the balances after transferring from another account', async () => {
        await token.approve(accounts[1], 500);
        await token.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        let balance;
        balance = await token.balanceOf.call(accounts[0]);
        assert.equal(balance, 1950);
        balance = await token.balanceOf.call(accounts[1]);
        assert.equal(balance, 0);
        balance = await token.balanceOf.call(accounts[2]);
        assert.equal(balance, 50);
    });

    it('verifies that transferring from another account fires a Transfer event', async () => {
        await token.approve(accounts[1], 500);
        let res = await token.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
    });

    it('verifies the new allowance after transferring from another account', async () => {
        await token.approve(accounts[1], 500);
        await token.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        let allowance = await token.allowance.call(accounts[0], accounts[1]);
        assert.equal(allowance, 450);
    });

    it('should throw when attempting to transfer from another account more than the allowance', async () => {
        await token.approve(accounts[1], 100);

        try {
            await token.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('should throw when attempting to transfer from an invalid account', async () => {
        await token.approve(accounts[1], 100);

        try {
            await token.transferFrom(invalidAccount, accounts[2], 50, { from: accounts[1] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });

    it('should throw when attempting to transfer from to an invalid account', async () => {
        await token.approve(accounts[1], 100);

        try {
            await token.transferFrom(accounts[0], invalidAccount, 50, { from: accounts[1] });
            assert(false, "didn't throw");
        }
        catch (error) {
            return utils.ensureException(error);
        }
    });
});
