pragma solidity ^0.4.17;
import './MintableToken.sol';
import './BurnableToken.sol';
import './StagedToken.sol';

/**
 * @title Expandable Token
 * @dev Token that can be expanded based on the current exchangeRate.
 */
contract PeggableToken is ERC20Token, StagedToken, BurnableToken {

    // TODO: The exchange rate should be eth to usdx 10^-8, down to the last precision.
    /** Peg the token after which they are all in stable state. */
    function peg(uint256 exchangeRate) onlyOwner public {
        if (exchangeRate > 100) {
            expansion(exchangeRate, 100);
        } else if (exchangeRate < 100) {
            contraction(exchangeRate, 100);
        }
    }

    /**
     * @dev Mint a specific amount of tokens based on the prevailing exchangeRate.
     * @param exchangeRate The prevailing rate to exchange Ethereum for USDX.
     */
    function expansion(uint256 exchangeRate, uint256 baseExchangeRate) onlyOwner internal {
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
     * @param exchangeRate The prevailing rate to exchange Ethereum for USDX.
     */
    function contraction(uint256 exchangeRate, uint256 baseExchangeRate) onlyOwner internal {
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
