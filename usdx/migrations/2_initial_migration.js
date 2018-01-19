var UstxToken = artifacts.require("./UstxToken.sol");
const Ownable = artifacts.require('Ownable.sol');
const ERC20Token = artifacts.require('ERC20Token.sol');

const TestERC20Token = artifacts.require('./helper/TestERC20Token.sol');
module.exports = function(deployer) {
  deployer.deploy(UstxToken);
  deployer.deploy(Ownable);
  deployer.deploy(ERC20Token);


  deployer.deploy(TestERC20Token);
};
