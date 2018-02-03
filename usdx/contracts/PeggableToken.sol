pragma solidity ^0.4.17;
import './MintableToken.sol';
import './BurnableToken.sol';
import './StagedToken.sol';

/**
 * @title Expandable Token
 * @dev Token that can be expanded based on the current exchangeRate.
 */
contract PeggableToken is ERC20Token, StagedToken, BurnableToken {


    // Enum that indicates the direction of monetary policy after an exchange
    // rate change. For example, an increase in exchange rate results in
    // minting more coins to distribute, hence corresponding to the Expansion
    // policy. A decrese in exchange rate, on the other hand, results in the
    // opposite where a portion of the circulating coins are collected and
    // destroyed, corresponding to the Contraction policy.
    enum MonetaryPolicy { Expansion, Contraction }


    /**
     *@param target Target address
     *@param policy The monetary policy used when stalizing coins
     *@param amount Change amount
     */
    event StableCoins(address indexed target, MonetaryPolicy policy,uint256 amount);


    //Exchange rate
    uint256 public exchangeRate;

    // TODO: The exchange rate should be eth to usdx 10^-8, down to the last precision.
    /** Peg the token after which they are all in stable state. */
    function peg() onlyOwner public {
        if (exchangeRate > 100) {
            expansion(100);
        } else if (exchangeRate < 100) {
            contraction(100);
        }
    }

    function setStabledRate(uint256 newExchangeRate) onlyOwner public {
        exchangeRate = newExchangeRate;
    }

    /**
     * @dev Mint a specific amount of tokens based on the prevailing exchangeRate.
     */
    function expansion(uint256 baseExchangeRate) onlyOwner internal {
        require(exchangeRate > baseExchangeRate);

        for(uint256 i = 0; i < stagedTokenAddresses.length; i++) {

            address account = stagedTokenAddresses[i];
            uint256 balance = balanceOf[account];

            // Proceed if and only if the user's balance is positive and the
            // coins haven't been stalized yet.
            if (balance > 0 && coinStatus[account] == CoinStatus.Share) {
                coinStatus[account] = CoinStatus.Stable;
                uint256 oldBalance = balance;

                // Calculate the number of new coins to mint.
                uint256 _amount = (balance * exchangeRate / baseExchangeRate) - oldBalance;
                mint(account, _amount);
            }
        }
    }

    /**
     * @dev Burn a specific amount of tokens based on the prevailing exchangeRate.
     */
    function contraction(uint256 baseExchangeRate) onlyOwner internal {
        require(exchangeRate < baseExchangeRate);

        for(uint256 i = 0; i < stagedTokenAddresses.length; i++) {

            address account = stagedTokenAddresses[i];
            uint256 balance = balanceOf[account];

            // Proceed if and only if the user's balance is positive and the
            // coins haven't been stalized yet.
            if (balance > 0 && coinStatus[account] == CoinStatus.Share) {
                coinStatus[account] = CoinStatus.Stable;

                // Calculate the number of excess coins to burn.
                uint256 newBalance = balance * exchangeRate / baseExchangeRate;
                burnForAddress(account, balance - newBalance);
            }
        }
    }
}
