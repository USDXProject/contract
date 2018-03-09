pragma solidity ^0.4.17;
import "../USDXToken.sol";

/*
    Test token with predefined supply
*/
contract TestUSDXToken is USDXToken {
    uint256 public initialSupply = 2000;// initial total amount

    function TestUSDXToken(string tokenName,string tokenSymbol,uint256 tokenDecimals)
    USDXToken(tokenName, tokenSymbol,tokenDecimals)
    public
    {
        balanceOf[msg.sender] = initialSupply;
    }


}
