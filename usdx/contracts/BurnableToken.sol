pragma solidity ^0.4.17;
import './ERC20Token.sol';
import './Ownable.sol';

/**
 * @title Burnable Token
 * @dev Token that can be irreversibly burned (destroyed).
 */
contract BurnableToken is ERC20Token, Ownable {
    event Burn(address indexed burner, uint256 value);

    /**
    * @dev Burns a specific amount of tokens.
    * @param _value The amount of token to be burned.
    */
    function burn(uint256 _value) public {
        burn(msg.sender, _value);
    }

    /**
    * @dev Burns a specific amount of tokens for a given address.
    * @param _from The address from which tokens will be burned.
    * @param _value The amount of tokens to be burned.
    */
    function burn(address _from, uint256 _value)
        onlyOwner public
    {
        require(_value <= balanceOf[_from]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balanceOf[_from] = safeSub(balanceOf[_from],_value);
        totalSupply = safeSub(totalSupply,_value);
        Burn(_from, _value);
    }
}
