pragma solidity ^0.4.17;

import "../BurnableToken.sol";


contract TestBurnableToken is BurnableToken {

  function TestBurnableToken(address initialAccount, uint initialBalance)
      ERC20Token("TestBurnable", "TB", 8)
      public
  {
    balanceOf[initialAccount] = initialBalance;
    totalSupply = initialBalance;
  }

}
