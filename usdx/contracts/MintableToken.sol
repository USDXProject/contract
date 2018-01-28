pragma solidity ^0.4.17;
import './ERC20Token.sol';
import './Ownable.sol';

/**
* @title Mintable token
* @dev Simple ERC20 Token example, with mintable token creation
* @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
* Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
*/
contract MintableToken is ERC20Token,Ownable {
    event Mint(address indexed to, uint256 amount);

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
   function mint(address _to, uint256 _amount)
   onlyOwner
   public
   returns (bool)
   {
       //totalSupply = totalSupply.add(_amount);
       totalSupply = safeAdd(totalSupply,_amount);
       balanceOf[_to] = safeAdd(balanceOf[_to],_amount);
       Mint(_to, _amount);
       Transfer(address(0), _to, _amount);
       return true;
   }


}
