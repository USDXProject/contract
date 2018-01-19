/* global artifacts, contract, it, assert */
/* eslint-disable prefer-reflect */

const Ownable = artifacts.require('Ownable.sol');


contract('Ownable', (accounts) => {

    it('verifies the manager after construction', function(){
        return Ownable.deployed().then(function(instance){
            return instance.owner.call();
        }).then(function(owner) {
            assert.equal(owner,accounts[0]);
        });
    })

    it('verifies the new owner after ownership transfer', function(){
        return Ownable.deployed().then(function(contract){
            contract.transferOwnership(accounts[1]);
            return contract.owner.call();
        }).then(function(owner){
            assert.equal(owner,accounts[1]);
        });
    })
});
