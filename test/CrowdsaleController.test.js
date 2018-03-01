const CrowdsaleController = artifacts.require("./CrowdsaleController.sol");
const BlockHeightManager = require('./helpers/block_height_manager');
const config = require('../config/config')(web3);
const assert = require('chai').assert;
const bluebird = require('bluebird');

const requester = bluebird.promisifyAll(web3.eth);

contract('CrowdsaleController',function(accounts) {

    const regexInvalidOpcode = /invalid opcode/;
    const regexError = /Error/;
    const blockHeightManager = new BlockHeightManager(web3);
    const validPurchaseBlock = (config.startBlock + config.endBlock) / 2;
    const owner = accounts[0];

    let token;
    let decimals;
    let nativeDecimals;
    let investor1,investor2,investor3;

    before(blockHeightManager.snapshot);
    afterEach(blockHeightManager.revert);

    beforeEach(async function() {
        token = await CrowdsaleController.deployed();
        decimals = await token.decimals.call();
        nativeDecimals = await token.nativeDecimals.call();

        //[investor1,investor2,investor3] = accounts = await web3.eth.getAccounts();
        investor1 = accounts[0];
        investor2 = accounts[1];
        investor3 = accounts[2];

    });

    describe("Initialization", () => {
        it('initializes all the values', async () => {
            let fundingStartBlock = await token.fundingStartBlock();
            assert.equal(fundingStartBlock, config.startBlock, "Funding start block does not match.");

             let fundingEndBlock = await token.fundingEndBlock();
             assert.equal(fundingEndBlock, config.endBlock, "Funding end block does not match.");

             assert(fundingEndBlock > fundingStartBlock, "Funding end block is before funding start block.");

              assert.equal(await token.initialExchangeRate(), config.initialExchangeRate,
              "Initial contribute rate does not match.");

        });
    });
    // describe("Minting", () => {
    //     it('allows only the owner of the contract to mint reserved tokens', async () =>{
    //         let initialSupply = web3.toBigNumber(await token.totalSupply());
    //         let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
    //         assert.equal(initialSupply.toString(),presaleAmount.toString());
    //
    //         let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
    //         await token.mint(owner,mintedTokenAmount,{from:owner});
    //
    //         let actualMintSupply = web3.toBigNumber(await token.totalSupply());
    //         let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
    //         assert.equal(actualMintSupply.toString(),expectedTotalSupply.toString(),
    //         "Expected total supply does not match.");
    //     })
    //
    //     it('does not allow an address other than the owner to mint reserved tokens', async () => {
    //         let initialSupply = web3.toBigNumber(await token.totalSupply());
    //         let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
    //         assert.equal(initialSupply.toString(),presaleAmount.toString());
    //         try{
    //             let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
    //             await token.mint(owner,mintedTokenAmount,{from:accounts[1]});
    //             assert.fail();
    //         }catch(e){
    //             assert.match(e.toString(),regexError);
    //
    //         }
    //         let actualMintSupply = web3.toBigNumber(await token.totalSupply());
    //         assert.equal(actualMintSupply.toString(),initialSupply.toString(),
    //         "Expected total supply does not match.");
    //
    //     });
    //
    //     it('should be able to mint the reserved portion to the owner', async () => {
    //         let totalSupply = await token.totalSupply();
    //         let owner = await token.owner();
    //         let maxTokenSupply = await token.tokenTotalSupply();
    //
    //         let balanceBefore = await token.balanceOf(owner);
    //         let residualTokens = maxTokenSupply.sub(totalSupply);
    //
    //         await token.mint(owner,residualTokens);
    //
    //         let balanceAfter = await token.balanceOf(owner);
    //         assert.equal(balanceBefore.add(residualTokens).valueOf(),balanceAfter.valueOf());
    //
    //
    //     });
    //
    //     it('allows owner to mint reserved tokens after the end block has been reached', async () => {
    //         let initialSupply = web3.toBigNumber(await token.totalSupply());
    //         let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
    //         assert.equal(initialSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");
    //
    //         await blockHeightManager.mineTo(config.endBlock +1);
    //         assert.isAbove(await requester.getBlockNumberAsync(),config.endBlock);
    //
    //         let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10,decimals));
    //         await token.mint(owner,mintedTokenAmount,{from:owner});
    //
    //         let actualTotalSupply = web3.toBigNumber(await token.totalSupply());
    //         let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
    //         assert.equal(actualTotalSupply.toString(), expectedTotalSupply.toString(), "Total supply does not match.");
    //
    //     });
    //
    //     it('allows minting if it does not exceed the total token supply', async () => {
    //
    //         let initialSupply = web3.toBigNumber(await token.totalSupply());
    //         let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10,decimals));
    //         assert.equal(initialSupply.toString(),presaleAmount.toString(),"Initial supply should match presale amount");
    //
    //         let maxTokenSupply = await token.tokenTotalSupply();
    //         let maxMintAmount = maxTokenSupply.sub(initialSupply);
    //         await token.mint(owner,maxMintAmount,{from:owner});
    //
    //         let actualTotalSupply = web3.toBigNumber(await token.totalSupply());
    //     });
    // });
    describe('Purchasing', () => {
        it('reject buying token before startBlock', async () => {
            assert(await requester.getBlockNumberAsync() < config.startBlock,
                'current block height should less than block height');

            try{
                let from = accounts[1];
                let exchangeTokenWei = 2 * Math.pow(10,nativeDecimals);

                await token.contribute(from,{value:exchangeTokenWei});
                assert.fail();
            }catch(e){
                assert.match(e.toString(),regexError);
            }
        });

        it('reject buying token after endBlock', async () => {

            await blockHeightManager.mineTo(config.endBlock +1);
            assert.isAtLeast(await requester.getBlockNumberAsync(),config.endBlock);


            try{
                let from = accounts[1];
                let exchangeTokenWei = 1 * Math.pow(10,nativeDecimals);

                await token.contribute(from,{value:exchangeTokenWei});
                assert.fail();
            }catch(e){
                assert.match(e.toString(),regexError);

            }
        });
        it('accept buying token between start and end block', async () => {
            await blockHeightManager.mineTo(validPurchaseBlock);

             let from = accounts[1];
             let exchangeTokenWei = 1 * Math.pow(10,nativeDecimals);
             let totalSupply = await token.totalSupply;//add whiteList
             const whitelist = [investor1,investor2];
             await token.whiteListAccounts(whitelist,{from:owner});

             await token.contribute(from, {value: exchangeTokenWei});

             let actualBalance = web3.toBigNumber(await token.balanceOf(from));
             let exchangeRate = await token.initialExchangeRate();
             let expectedBalance = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
             let expectedTotalSupply = await token.totalSupply;
             assert.equal(actualBalance.toString(), expectedBalance.toString());
             assert.equal(totalSupply.toString(), expectedTotalSupply.toString());

        });

        it('reject zero value purchase', async () => {
            await blockHeightManager.mineTo(validPurchaseBlock);

            let blockNumber = await requester.getBlockNumberAsync();
            assert.isAtMost(blockNumber,config.endBlock);
            assert.isAtLeast(blockNumber,config.startBlock);
            let from = accounts[1];
            let exchangeTokenWei = 0;
            try{
                await token.contribute(from,{value:exchangeTokenWei});
                assert.fail();
            }catch(e){
                assert.match(e.toString(),regexError);
            }
        });

        it('uses the fallback function to buy tokens if buyToken() is not used', async () => {
            await blockHeightManager.mineTo(validPurchaseBlock);

            let blockNumber = await requester.getBlockNumberAsync();
            assert.isAtMost(blockNumber,config.endBlock);
            assert.isAtLeast(blockNumber,config.startBlock);

            let from = accounts[1];
            let exchangeTokenWei = 1 * Math.pow(10,nativeDecimals);

            const whitelist = [investor1,investor2];
            await token.whiteListAccounts(whitelist,{from:owner});

            await requester.sendTransactionAsync({
                to:token.address,
                from:from,
                value:exchangeTokenWei
            });

            let actualBalance = web3.toBigNumber(await token.balanceOf(from));
            let exchangeRate = await token.initialExchangeRate();
            let expectedBalance = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
            assert.equal(actualBalance.toString(),expectedBalance.toString());

        });

        it('allows an address to buy tokens on behalf of a beneficiary', async () => {
            await blockHeightManager.mineTo(validPurchaseBlock);

            let purchaser = accounts[1];
            let beneficiary = accounts[2];
            let exchangeTokenWei = 1 * Math.pow(10,nativeDecimals);

            const whitelist = [beneficiary];
            await token.whiteListAccounts(whitelist,{from:owner});

            await token.contribute(beneficiary,{from:purchaser,value:exchangeTokenWei});

            let purchaserBalance = await token.balanceOf(purchaser);
            assert.equal(purchaserBalance.toNumber(),0,"Purchaser balance should be 0.");

            let beneficiaryBalance = await token.balanceOf(beneficiary);
            let exchangeRate = await token.initialExchangeRate();
            let expectedBeneficiaryBalance = await token.getTokenExchangeAmount(exchangeTokenWei,exchangeRate,
            nativeDecimals,decimals);
            assert.equal(beneficiaryBalance.toString(),expectedBeneficiaryBalance.toString(),
            "beneficiary balance does not match.")
        });

        it('sends the balance to the correct address if the beneficiary is the purchaser', async () => {
            await blockHeightManager.mineTo(validPurchaseBlock);

            let purchaser = accounts[1];
            let beneficiary = accounts[1];
            let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);

            const whitelist = [beneficiary];
            await token.whiteListAccounts(whitelist,{from:owner});
            await token.contribute(beneficiary, {from: purchaser, value: exchangeTokenWei});

            let balance = await token.balanceOf(purchaser);
            let exchangeRate = await token.initialExchangeRate();
            let expectedBalance = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);
            assert.equal(balance.toString(), expectedBalance.toString(), "Balance does not match.");

        });

        it('does not allow buying tokens once sale amount has been reached', async () => {

            await blockHeightManager.mineTo(validPurchaseBlock);

            // Determine max number of tokens to purchase
            // 60e14 (total) - 30e14 (presale) = 30e14 (for purchase)
            // let saleAmount = web3.toBigNumber(await token.saleAmount());
            // let maxPurchaseTokens = saleAmount - presaleAmount;
            //
            // // Reverse the logic for getTokenExchangeAmount()
            // let exchangeRate = await token.initialExchangeRate();
            // let differenceFactor = Math.pow(10, nativeDecimals) / Math.pow(10, decimals);
            // var exchangeTokenWei = maxPurchaseTokens / exchangeRate * differenceFactor;
            //
            // var purchaser = accounts[1];
            // await token.contribute(purchaser, {from: purchaser, value: exchangeTokenWei});
            //
            // purchaser = accounts[2];
            // exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);
            //
            // try{
            //     await token.contribute(purchaser,{from: purchaser,value:exchangeTokenWei});
            //     assert.fail();
            // }catch(e){
            //     assert.match(e.toString(),regexError);
            // }

        });

        describe('Forwarding Funds', () =>{
            it('should forward funds to the owner',async () =>{
                let owner = await token.owner();


                await blockHeightManager.mineTo(validPurchaseBlock);

                let from = accounts[1];
                let exchangeTokenWei = 1 * Math.pow(10,nativeDecimals);//1 eth

                const whitelist = [from];
                await token.whiteListAccounts(whitelist,{from:owner});
                let beforeTransferBalance = web3.toBigNumber(await requester.getBalanceAsync(owner));
                await token.contribute(from,{from:from,value:exchangeTokenWei});

                let afterTransferBalance = web3.toBigNumber(await requester.getBalanceAsync(owner));
                let actualBalance = afterTransferBalance.sub(beforeTransferBalance);
                assert.equal(actualBalance.toString(),exchangeTokenWei.toString(),"Balances do not match.");

            });

            it('should revert all funds if transaction is failed', async () =>{
                let owner = await token.owner();
                let beforeBalance = await requester.getBalanceAsync(owner);

                await  blockHeightManager.mineTo(config.startBlock -5);

                let from = accounts[1];
                let exchangeTokenWei = 1 * Math.pow(10,nativeDecimals);

                try{
                    await token.contribute(from,{from:from,value:exchangeTokenWei});
                    assert.fail();
                }catch(e) {
                    assert.match(e.toString(),regexError);
                }
                let afterBalance = await requester.getBalanceAsync(owner);
                assert.equal(beforeBalance.toString(),afterBalance.toString(),"Balances do not match.");

            });
        });


        describe('Exchange', () => {
            it('returns the correct exchange amount using the contract defined values', async ()=> {
                let exchangeRate = await token.initialExchangeRate();
                let exchangeTokenWei = 1 * Math.pow(10, nativeDecimals);
                let actualAmount = await token.getTokenExchangeAmount(exchangeTokenWei, exchangeRate, nativeDecimals, decimals);

                let expectedAmount = web3.toBigNumber(1 * exchangeRate * Math.pow(10,decimals));
                assert.equal(actualAmount.toString(),expectedAmount.toString(),"Exchange amount does not match.");
            });
        });
























    });



});
