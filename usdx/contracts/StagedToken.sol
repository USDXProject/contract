pragma solidity ^0.4.17;
import './ERC20Token.sol';
import './MintableToken.sol';
import './Ownable.sol';

/**
* @title Staged token
* @dev Token that can be in one of several predefined statuses at a given time
*/
contract StagedToken is MintableToken {

    // Enum that indicates the status of coins. Share state means the coins have
    // not been pegged. After the initial pegging, coins status will turn to
    // Stable. This process is irreversible. Initial is the state when the
    // account is first activated with no coin balance.
    enum CoinStatus { Initial, Share, Stable }

    // A mapping that keeps record of the coin status for each address.
    mapping (address => CoinStatus) public coinStatus;

    // A record of all addresses that contains (or once contained) this token.
    address[] public stagedTokenAddresses;

     function mint(address _to, uint256 _amount)
     public
     returns (bool)
     {
         recordAddress(_to);
         super.mint(_to, _amount);
     }

    function transfer(address _to, uint256 _value)
    public
    returns (bool) {
        recordAddress(_to);
        super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value)
    public
    returns (bool)
    {
        recordAddress(_to);
        super.transferFrom(_from, _to, _value);
    }

    function recordAddress(address _to) validAddress(_to) internal {
        // If the _to address is in Initial status and has no balance, then add
        // it to the list of addresses.
        if (coinStatus[_to] == CoinStatus.Initial){
            require(balanceOf[_to] == 0);
            coinStatus[_to] = CoinStatus.Share;
            stagedTokenAddresses.push(_to);
        }
    }
}
