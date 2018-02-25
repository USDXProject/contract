pragma solidity ^0.4.18;

import "./USDXToken.sol";
import "./Ownable.sol";
import "./SafeMath.sol";


/**
 * @title USDXVesting
 * @dev A token holder contract that can release its token balance gradually like a
 * typical vesting scheme, with a cliff and vesting period. Optionally revocable by the
 * owner.
 */
contract USDXVesting is Ownable {

  event Released(uint256 amount);
  event Revoked();

  // beneficiary of tokens after they are released
  address public beneficiary;

  uint256 public cliff;
  uint256 public start;
  uint256 public duration;

  bool public revocable;

  uint256 public released;
  bool public revoked;

  USDXToken public usdxToken;

  /**
   * @dev Creates a vesting contract that vests its balance of any ERC20 token to the
   * _beneficiary, gradually in a linear fashion until _start + _duration. By then all
   * of the balance will have vested.
   * @param _usdxToken the deployed USDXToken contract
   * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
   * @param _cliff duration in seconds of the cliff in which tokens will begin to vest
   * @param _duration duration in seconds of the period in which the tokens will vest
   * @param _revocable whether the vesting is revocable or not
   */
  function USDXVesting(USDXToken _usdxToken, address _beneficiary, uint256 _start, uint256 _cliff, uint256 _duration, bool _revocable) public {
    require(_beneficiary != address(0));
    require(_cliff <= _duration);

    usdxToken = _usdxToken;
    beneficiary = _beneficiary;
    revocable = _revocable;
    duration = _duration;
    cliff = _start + _cliff;
    start = _start;
  }

  /**
   * @notice Transfers vested tokens to beneficiary.
   */
  function release() public {
    uint256 unreleased = releasableAmount();

    require(unreleased > 0);

    released = released + unreleased;
    usdxToken.transfer(beneficiary, unreleased);

    Released(unreleased);
  }

  /**
   * @notice Allows the owner to revoke the vesting. Tokens already vested
   * remain in the contract, the rest are returned to the owner.
   */
  function revoke() public onlyOwner {
    require(revocable);
    require(!revoked);

    uint256 balance = usdxToken.balanceOf(this);

    uint256 unreleased = releasableAmount();
    uint256 refund = balance - unreleased;

    revoked = true;

    usdxToken.transfer(owner, refund);

    Revoked();
  }

  /**
   * @dev Calculates the amount that has already vested but hasn't been released yet.
   */
  function releasableAmount() public view returns (uint256) {
    return vestedAmount() - released;
  }

  /**
   * @dev Calculates the amount that has already vested.
   */
  function vestedAmount() public view returns (uint256) {
    uint256 currentBalance = usdxToken.balanceOf(this);
    uint256 totalBalance = currentBalance + released;

    if (now < cliff) {
      return 0;
    } else if (now >= start + duration || revoked) {
      return totalBalance;
    } else {
      return totalBalance * (now - start) / duration;
    }
  }
}
