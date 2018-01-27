/* global artifacts, contract, it, assert */
/* eslint-disable prefer-reflect */

const Ownable = artifacts.require('Ownable.sol');


contract('Ownable', (accounts) => {

    it('verifies the manager after construction', async () => {
        let contract = await Ownable.new();
        let owner = await contract.owner.call();
        assert.equal(owner,accounts[0]);
    });

    it('verifies the new owner after ownership transfer', async () => {
        let contract = await Ownable.new();
        await contract.transferOwnership(accounts[1])
        let owner = await contract.owner.call();
        assert.equal(owner,accounts[1]);
    });

});
