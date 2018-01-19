pragma solidity ^0.4.17;
import './ERC20Token.sol';

/**
 * @title Burnable Token
 * @dev Token that can be irreversibly burned (destroyed).
 */
contract BurnableToken is ERC20Token {
    event Burn(address indexed burner, uint256 value);

    /**
    * @dev Burns a specific amount of tokens.
    * @param _value The amount of token to be burned.
    */
    function burn(uint256 _value) public {
        require(_value <= balanceOf[msg.sender]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        address burner = msg.sender;
        balanceOf[burner] = safeSub(balanceOf[burner],_value);
        totalSupply = safeSub(totalSupply,_value);
        Burn(burner, _value);
    }
}
