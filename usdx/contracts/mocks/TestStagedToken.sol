pragma solidity ^0.4.17;

import "../StagedToken.sol";


contract TestStagedToken is StagedToken {

  function TestStagedToken(uint256 initialSupply)
      ERC20Token("TestMintable", "TM", 8)
      public {
    totalSupply = initialSupply;
    recordAddress(msg.sender);
    balanceOf[msg.sender] = initialSupply;
  }
}
