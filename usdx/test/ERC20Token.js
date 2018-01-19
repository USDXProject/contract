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

    it('should throw when attempting to transfer more than the balance',function(){
        let status;
        return TestERC20Token.deployed().then(function(instance){
            return instance.transfer(accounts[1],20000).then(function(){
                //assert(false, "didn't throw");
                status =1;
            }).catch(function(){
                //assert(true, "did throw");
                status = 2;
            });
        }).then(function(){
            assert(status ==2);
        });
    });

    it('should throw when attempting to transfer to an invalid address',function() {
        let meta;
        let status =2;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;

            meta.transfer(invalidAccount,10).then(function(){
                status = 1;
            }).catch(function(){
                status = 2;
            });
        }).then(function(){
            //assert(false, "didn't throw");
            assert(status ==2);
        });
    });

    it('verifies the allowance after an approval', function(){
        let meta;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            meta.approve(accounts[1],500);
            return meta;
        }).then(function(instance){
            return instance.allowance.call(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance, 500);
        });
    });

    it('verifies that an approval fires an Approval event',  function(){
        let meta;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            return meta.approve(accounts[1], 50);
        }).then(function(res){
            assert(res.logs.length > 0 && res.logs[0].event == 'Approval');
        });
    });

    it('should throw when attempting to define allowance for an invalid address', function(){
        let meta;
        let status =2;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            meta.approve(invalidAccount, 10).then(function(){
                status = 1;
            }).catch(function(){
                status = 2;
            });
        }).then(function(){
            assert(status ==2);
        });
    });


    it('verifies the balances after transferring from another account', function(){
        let meta;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            meta.approve(accounts[1], 500);
        }).then(function(){
            meta.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        }).then(function(){
            return meta.balanceOf.call(accounts[0]);
        }).then(function(balance){
            assert.equal(balance, 1950);
            return meta.balanceOf.call(accounts[1]);

        }).then(function(balance){
            assert.equal(balance, 0);
            return meta.balanceOf.call(accounts[2]);
        }).then(function(balance){
            assert.equal(balance, 50);
        });
    });

    it('verifies that transferring from another account fires a Transfer event', function(){
        let meta;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            meta.approve(accounts[1], 500);
        }).then(function(){
            return meta.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        }).then(function(res){
            assert(res.logs.length > 0 && res.logs[0].event == 'Transfer');
        });
    });

    it('verifies the new allowance after transferring from another account', function(){
        let meta;
        return TestERC20Token.deployed().then(function(instance){
            meta.approve(accounts[1], 500);
        }).then(function(){
            meta.transferFrom(accounts[0], accounts[2], 50, { from: accounts[1] });
        }).then(function(){
            return meta.allowance.call(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance, 450);
        });
    });

    //question
    it('should throw when attempting to transfer from another account more than the allowance', function(){
        let meta;
        let status = 2;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            meta.approve(accounts[1], 100);
        }).then(function(){
            meta.transferFrom(accounts[0], accounts[2], 200, { from: accounts[1] })
                .then(function(){
                    status = 1;
                }).catch(function(){
                    status = 2;
                });

        }).then(function(){
            assert(status == 1);
        });
    });

    //question
    it('should throw when attempting to transfer from an invalid account', function(){
        let meta;
        let status = 2;
        return TestERC20Token.deployed().then(function(instance){
            meta.approve(accounts[1], 100);
        }).then(function(){
            meta.transferFrom(invalidAccount, accounts[2], 50, { from: accounts[1] })
                .then(function(){
                    status = 1;
                }).catch(function(){
                    status = 2;
                });
            //assert(false, "didn't throw");
        }).then(function(){
            assert(status == 1);
        });
    });

    it('should throw when attempting to transfer from to an invalid account', function(){
        let meta;
        let status = 2;
        return TestERC20Token.deployed().then(function(instance){
            meta = instance;
            meta.approve(accounts[1], 100);
        }).then(function(){
            meta.transferFrom(accounts[0], invalidAccount, 50, { from: accounts[1] })
                .then(function(){
                    status = 1;
                }).catch(function(){
                    status = 2;
                });

        }).then(function(){
            assert(status == 1);
        });
    });






});
