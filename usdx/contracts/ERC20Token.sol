pragma solidity ^0.4.17;
import './SafeMath.sol';

/**
    ERC20Token Standard Token implementation
*/
contract ERC20Token is SafeMath {

    string public constant standard = '1.0';
    uint8 public decimals = 0;
    // you need change the following three values
    string public name;//token name
    string public symbol;//token symbol
    //Default assumes totalSupply can't be over max (2^256 - 1).
    //you need multiply 10^decimals by your real total supply.
    uint256 public totalSupply;

    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function ERC20Token(uint256 initialSupply,string tokenName,string tokenSymbol,uint8 tokenDecimals) public {
        //Initial total amount
        totalSupply = initialSupply * 10 ** uint256(decimals);
        //Initialize the token to the Creator
        balanceOf[msg.sender] = totalSupply;
        name = tokenName;
        symbol = tokenSymbol;
        decimals = tokenDecimals;
    }

    // validates an address - currently only checks that it isn't null
    modifier validAddress(address _address) {
        require(_address != 0x0);
        _;
    }

    function transfer(address _to, uint256 _value) public validAddress(_to) returns (bool success) {
        balanceOf[msg.sender] = safeSub(balanceOf[msg.sender], _value);
        balanceOf[_to] = safeAdd(balanceOf[_to], _value);
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public validAddress(_from) validAddress(_to) returns (bool success) {
        allowance[_from][msg.sender] = safeSub(allowance[_from][msg.sender], _value);
        balanceOf[_from] = safeSub(balanceOf[_from], _value);
        balanceOf[_to] = safeAdd(balanceOf[_to], _value);
        Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public validAddress(_spender) returns (bool success) {
        // To change the approve amount you first have to reduce the addresses`
        //  allowance to zero by calling `approve(_spender, 0)` if it is not
        //  already 0 to mitigate the race condition described here:
        require(_value == 0 || allowance[msg.sender][_spender] == 0);
        allowance[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }
}
