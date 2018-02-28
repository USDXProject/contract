let CrowdsaleController = artifacts.require("CrowdsaleController.sol");
let USDXToken = artifacts.require("USDXToken.sol");
let config = require('../config/config')(web3);
//const TestERC20Token = artifacts.require('./helper/TestERC20Token.sol');
//const TestUSDXToken = artifacts.require('./mocks/TestUSDXToken.sol');

module.exports = function(deployer) {
  deployer.deploy(CrowdsaleController,config.startBlock,config.endBlock,config.initialExchangeRate,config.name,config.symbol,config.decimals);
  //deployer.deploy(USDXToken, config.name, config.symbol, config.decimals);
  //deployer.deploy(TestERC20Token);
  //deployer.deploy(TestUSDXToken,config.name,config.symbol,config.decimals);
};
