pragma solidity ^0.4.17;
import './ERC20Token.sol';
import './Ownable.sol';

/**
* @title Staged token
* @dev Token that can be in one of several predefined statuses at a given time
*/
contract StagedToken is ERC20Token {

    // Enum that indicates the status of coins. Share state means the coins have
    // not been pegged. After the initial pegging, coins status will turn to
    // Stable. This process is irreversible. Initial is the state when the
    // account is first activated with no coin balance.
    enum CoinStatus { Initial, Share, Stable }

    // A mapping that keeps record of the coin status for each address.
    mapping (address => CoinStatus) public coinStatus;

    // A record of all addresses that contains (or once contained) this token.
    address[] public allTokenAddr;

    function recordAddress(address _to)
    validAddress(_to)
    internal
    {
        // If the _to address is in Initial status and has no balance, then add
        // it to the list of addresses.
        if (coinStatus[_to] == CoinStatus.Initial){
        //if (balanceOf[_to] == 0 && coinStatus[_to] == CoinStatus.Initial){
            coinStatus[_to] = CoinStatus.Share;
            allTokenAddr.push(_to);
        }
    }
}
