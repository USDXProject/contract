pragma solidity ^0.4.17;

import 'zeppelin-solidity/contracts/token/ERC20/BurnableToken.sol';
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title Burnable Token
 * @dev Token that can be irreversibly burned (destroyed).
 */
contract TargetedBurnableToken is BurnableToken, Ownable {
    /**
    * @dev Burns a specific amount of tokens for a given address.
    * @param _from The address from which tokens will be burned.
    * @param _value The amount of tokens to be burned.
    */
    function burn(address _from, uint256 _value)
        onlyOwner public
    {
        require(_value <= balances[_from]);
        // no need to require value <= totalSupply, since that would imply the
        // sender's balance is greater than the totalSupply, which *should* be an assertion failure

        balances[_from] = balances[_from].sub(_value);
        totalSupply_ = totalSupply_.sub(_value);
        Burn(_from, _value);
    }
}
