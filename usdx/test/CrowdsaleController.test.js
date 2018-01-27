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

    before(blockHeightManager.snapshot);
    afterEach(blockHeightManager.revert);

    beforeEach(async function() {
        token = await CrowdsaleController.deployed();
        decimals = await token.decimals.call();
        nativeDecimals = await token.nativeDecimals.call();
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

            let tokenTotalSupply = web3.toBigNumber(await token.tokenTotalSupply());
            let expectedSaleAmount = web3.toBigNumber(20e3 * Math.pow(10, decimals));// * Math.pow(10, decimals)
            assert.equal(tokenTotalSupply.toString(), expectedSaleAmount.toString(), "Sale amount does not match.");

            let totalSupply = web3.toBigNumber(await token.totalSupply());
            let expectedTotalSupply = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
            assert.equal(totalSupply.toString(), expectedTotalSupply.toString());

        });

        it("should mint presale token and allocate to the owner", async function(){
              let owner = await token.owner();
              let ownerBalance = await token.balanceOf(owner);
              let expectedPreSaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
             assert.equal(ownerBalance.toString(),expectedPreSaleAmount.toString(),
             "Owner balance does not match presale amount.");

             let totalSupply = await token.totalSupply();
             assert.equal(totalSupply.toString(),expectedPreSaleAmount.toString(),
             "Total supply does not match the presale amount.");
        });

    });
    describe("Minting", () => {
        it('allows only the owner of the contract to mint reserved tokens', async () =>{
            let initialSupply = web3.toBigNumber(await token.totalSupply());
            let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
            assert.equal(initialSupply.toString(),presaleAmount.toString());

            let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
            await token.mint(owner,mintedTokenAmount,{from:owner});

            let actualMintSupply = web3.toBigNumber(await token.totalSupply());
            let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
            assert.equal(actualMintSupply.toString(),expectedTotalSupply.toString(),
            "Expected total supply does not match.");
        })

        it('does not allow an address other than the owner to mint reserved tokens', async () => {
            let initialSupply = web3.toBigNumber(await token.totalSupply());
            let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
            assert.equal(initialSupply.toString(),presaleAmount.toString());
            try{
                let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10, decimals));
                await token.mint(owner,mintedTokenAmount,{from:accounts[1]});
                assert.fail();
            }catch(e){
                assert.match(e.toString(),regexError);

            }
            let actualMintSupply = web3.toBigNumber(await token.totalSupply());
            assert.equal(actualMintSupply.toString(),initialSupply.toString(),
            "Expected total supply does not match.");

        });

        it('should be able to mint the reserved portion to the owner', async () => {
            let totalSupply = await token.totalSupply();
            let owner = await token.owner();
            let maxTokenSupply = await token.tokenTotalSupply();

            let balanceBefore = await token.balanceOf(owner);
            let residualTokens = maxTokenSupply.sub(totalSupply);

            await token.mint(owner,residualTokens);

            let balanceAfter = await token.balanceOf(owner);
            assert.equal(balanceBefore.add(residualTokens).valueOf(),balanceAfter.valueOf());


        });

        it('allows owner to mint reserved tokens after the end block has been reached', async () => {
            let initialSupply = web3.toBigNumber(await token.totalSupply());
            let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10, decimals));
            assert.equal(initialSupply.toString(), presaleAmount.toString(), "Initial supply should match presale amount.");

            await blockHeightManager.mineTo(config.endBlock +1);
            assert.isAbove(await requester.getBlockNumberAsync(),config.endBlock);

            let mintedTokenAmount = web3.toBigNumber(10e6 * Math.pow(10,decimals));
            await token.mint(owner,mintedTokenAmount,{from:owner});

            let actualTotalSupply = web3.toBigNumber(await token.totalSupply());
            let expectedTotalSupply = initialSupply.add(mintedTokenAmount);
            assert.equal(actualTotalSupply.toString(), expectedTotalSupply.toString(), "Total supply does not match.");

        });

        it('allows minting if it does not exceed the total token supply', async () => {

            let initialSupply = web3.toBigNumber(await token.totalSupply());
            let presaleAmount = web3.toBigNumber(config.presaleAmount * Math.pow(10,decimals));
            assert.equal(initialSupply.toString(),presaleAmount.toString(),"Initial supply should match presale amount");

            let maxTokenSupply = await token.tokenTotalSupply();
            let maxMintAmount = maxTokenSupply.sub(initialSupply);
            await token.mint(owner,maxMintAmount,{from:owner});

            let actualTotalSupply = web3.toBigNumber(await token.totalSupply());
        });
    });
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
             let totalSupply = await token.totalSupply;
             await token.contribute(from, {value: exchangeTokenWei});

             let actualBalance = web3.toBigNumber(await token.balanceOf(from));
             let exchangeRate = await token.initialExchangeRate();
             let expectedBalance = web3.toBigNumber(1 * exchangeRate * Math.pow(10, decimals));
             let expectedTotalSupply = await token.totalSupply;
             assert.equal(actualBalance.toString(), expectedBalance.toString());
             assert.equal(totalSupply.toString(), expectedTotalSupply.toString());

        });
    });

});
