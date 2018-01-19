pragma solidity ^0.4.17;
import "../ERC20Token.sol";

/*
    Test token with predefined supply
*/
contract TestERC20Token is ERC20Token {
    string public constant tokenName = "USTX";//token name
    string public constant tokenSymbol = "USTX";//token symbol
    uint256 public initialSupply = 2000;// initial total amount
    uint8 public tokenDecimals = 0;
    function TestERC20Token()
         ERC20Token(initialSupply, tokenName, tokenSymbol,tokenDecimals) public
    {
        balanceOf[msg.sender] = initialSupply;
    }


}
