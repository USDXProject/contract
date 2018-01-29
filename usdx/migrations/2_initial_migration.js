
let CrowdsaleController = artifacts.require("CrowdsaleController.sol");
let config = require('../config/config')(web3);
const TestERC20Token = artifacts.require('./helper/TestERC20Token.sol');
const TestBurnableToken = artifacts.require('./helper/TestBurnableToken.sol');
module.exports = function(deployer) {
  deployer.deploy(CrowdsaleController,config.startBlock,config.endBlock,config.initialExchangeRate,config.presaleAmount,config.founderPercentOfTotal,config.name,config.symbol,config.decimals);
  deployer.deploy(TestERC20Token);
  deployer.deploy(TestBurnableToken);
};
