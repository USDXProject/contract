/* global artifacts, contract, it, assert */
/* eslint-disable prefer-reflect */

const TestERC20Token = artifacts.require('TestERC20Token.sol');
const utils = require('./helpers/Utils');


const invalidAccount = '0x0';


contract('ERC20Token', (accounts) => {
    it('verifies the token name after construction', function(){
        return TestERC20Token.deployed().then(function(instance){
            return instance.name.call();
        }).then(function(name){
            assert.equal(name,'USTX');
        });

    });

    it('verifies the token symbol after construction', function(){
        return TestERC20Token.deployed().then(function(instance){
            return instance.symbol.call();
        }).then(function(name){
            assert.equal(name,'USTX');
        });
    });

    it('verifies the balances after a transfer', function(){
        var meta;
        var account_one = accounts[0];
        var account_two = accounts[1];
        var account_one_balance;
        var account_two_balance;

        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            instance.transfer(account_two,500);
            return instance;
        }).then(function(instance){
            return instance.balanceOf.call(account_two);
        }).then(function(balance){
            account_two_balance = balance.toNumber();
            return meta.balanceOf.call(account_one);
        }).then(function(balance){
            account_one_balance = balance.toNumber();

            assert.equal(account_two_balance,500);
            assert.equal(account_one_balance,1500);

        });
    });

    it('verifies that a transfer fires a Transfer event', function(){
        return TestERC20Token.deployed().then(function(instance){
            let res = instance.transfer(accounts[1],500);
            return res;
        }).then(function(res){
            assert(res.logs.length >0 && res.logs[0].event == 'Transfer');
        });
    });






});
