pragma solidity ^0.4.17;

import "../MintableToken.sol";


contract TestMintableToken is MintableToken {

  function TestMintableToken()
      ERC20Token("TestMintable", "TM", 8)
      public
  {}

}
