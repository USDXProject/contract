/* global artifacts, contract, it, assert */
/* eslint-disable prefer-reflect */
const TestERC20Token = artifacts.require('TestERC20Token.sol');
const BigNumber = web3.BigNumber;
const utils = require('./helpers/Utils');
const EventVerifier = require('./helpers/EventVerifier');
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
        name.should.equal('TestERC20');
    });

    it('verifies the token symbol after construction', async () => {
        let symbol = await token.symbol.call();
        symbol.should.equal('TERC');
    });

    it('verifies the balances after a transfer', async () => {
        const result = await token.transfer(accounts[1], 500);
        let balance;
        balance = await token.balanceOf.call(accounts[0]);
        balance.should.be.bignumber.equal(1500);
        balance = await token.balanceOf.call(accounts[1]);
        balance.should.be.bignumber.equal(500);

        EventVerifier.transferEvent(result, accounts[0], accounts[1], 500);
    });

    it('verifies that a transfer fires a Transfer event', async () => {
        let result = await token.transfer(accounts[1], 500);
        EventVerifier.transferEvent(result, accounts[0], accounts[1], 500);
    });

    it('should throw when attempting to transfer more than the balance', async () => {
        await token.transfer(accounts[1], 5000)
            .should.be.rejectedWith(utils.revert);
    });

    it('should throw when attempting to transfer to an invalid address', async () => {
        await token.transfer(invalidAccount, 10)
            .should.be.rejectedWith(utils.revert);
    });

    it('verifies the allowance after an approval', async () => {
        let result = await token.approve(accounts[1], 500);
        let balance = await token.allowance.call(accounts[0], accounts[1]);
        balance.should.be.bignumber.equal(500);

        EventVerifier.approvalEvent(result, accounts[0], accounts[1], 500);
    });

    it('verifies that an approval fires an Approval event', async () => {
        let result = await token.approve(accounts[1], 500);
        EventVerifier.approvalEvent(result, accounts[0], accounts[1], 500);
    });

    it('should throw when attempting to define allowance for an invalid address', async () => {
        await token.approve(invalidAccount, 10)
            .should.be.rejectedWith(utils.revert);
    });

    it('verifies the balances after transferring from another account', async () => {
        await token.approve(accounts[1], 500);
        await token.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        let balance;
        balance = await token.balanceOf.call(accounts[0]);
        balance.should.be.bignumber.equal(1950);
        balance = await token.balanceOf.call(accounts[1]);
        balance.should.be.bignumber.equal(0);
        balance = await token.balanceOf.call(accounts[2]);
        balance.should.be.bignumber.equal(50);
    });

    it('verifies that transferring from another account fires a Transfer event', async () => {
        let approveResult = await token.approve(accounts[1], 500);
        let transferResult = await token.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        EventVerifier.approvalEvent(approveResult, accounts[0], accounts[1], 500);
        EventVerifier.transferEvent(transferResult, accounts[0], accounts[2], 50);
    });

    it('verifies the new allowance after transferring from another account', async () => {
        await token.approve(accounts[1], 500);
        await token.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        let allowance = await token.allowance.call(accounts[0], accounts[1]);
        allowance.should.be.bignumber.equal(450);
    });

    it('should throw when attempting to transfer from another account more than the allowance', async () => {
        await token.approve(accounts[1], 100);
        await token.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] })
            .should.be.rejectedWith(utils.revert);
    });

    it('should throw when attempting to transfer from an invalid account', async () => {
        await token.approve(accounts[1], 100);
        await token.transferFrom(invalidAccount, accounts[2], 50, { from: accounts[1] })
            .should.be.rejectedWith(utils.revert);
    });

    it('should throw when attempting to transfer from to an invalid account', async () => {
        await token.approve(accounts[1], 100);
        await token.transferFrom(accounts[0], invalidAccount, 50, { from: accounts[1] })
            .should.be.rejectedWith(utils.revert);
    });
});
