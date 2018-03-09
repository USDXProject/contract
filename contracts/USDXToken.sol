pragma solidity ^0.4.17;
import './ERC20Token.sol';
import './Ownable.sol';

interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public; }
/**
 * @title The final USDX token
 */
contract USDXToken is ERC20Token, Ownable {

    mapping (address => bool) public frozenAccount;//Whether or not to freeze a list of accounts

    event FrozenFunds(address indexed target, bool frozen);

    function USDXToken(
        string _name,
        string _symbol,
        uint256 _decimals)
    ERC20Token(_name, _symbol,_decimals)
    public {
        owner = msg.sender;
    }

    function approveAndCall(
        address _spender,
        uint256 _value,
        bytes _extraData)
    public
    returns (bool success)
    {
        tokenRecipient spender = tokenRecipient(_spender);
        if(approve(_spender,_value)) {
            spender.receiveApproval(msg.sender,_value,this,_extraData);
            return true;
        }
    }

    function transfer(address _to, uint256 _value)
    accountFreezed(msg.sender)
    public
    returns (bool) {
        super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value)
    accountFreezed(msg.sender)
    public
    returns (bool)
    {
        super.transferFrom(_from, _to, _value);
    }

   /**
    * Freeze accounts and thaw accounts
    *  @param target address account address
    *  @param freeze bool Whether it is frozen
    *
    */
    function freezeAccount(address target,bool freeze)
    onlyOwner
    public
    {
        frozenAccount[target] = freeze;
        FrozenFunds(target, freeze);
    }

   //whether the account is frozen
    modifier accountFreezed(address _to)
    {
        require(!frozenAccount[_to]);
        _;
    }
}
