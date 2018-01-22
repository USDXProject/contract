pragma solidity ^0.4.17;
import './MintableToken.sol';
import './BurnableToken.sol';


interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public; }
/**
 * @title The final Ustx token
 */
contract UstxToken  is MintableToken,BurnableToken {

    // Enum that indicates the direction of monetary policy after an exchange
    // rate change. For example, an increase in exchange rate results in
    // minting more coins to distribute, hence corresponding to the Expansion
    // policy. A decrese in exchange rate, on the other hand, results in the
    // opposite where a portion of the circulating coins are collected and
    // destroyed, corresponding to the Contraction policy.
    enum MonetaryPolicy { Expansion, Contraction }

    string public constant tokenName = "USTX";//token name
    string public constant tokenSymbol = "USTX";//token symbol
    //uint256 public initialSupply = 2*10**9;// initial total amount
    //uint8 public constant tokenDecimals = 8;

    uint256 public initialSupply = 3000;// initial total amount
    uint8 public constant tokenDecimals = 0;
    bool public halted = false;//When an emergency occurs, the creator can call the halt function, stop all operations on the funds

    uint256 public exchangeRate;//Exchange rate
    mapping (address => bool) public frozenAccount;//Whether or not to freeze a list of accounts
    mapping (address => uint8) stabled;//share token turn into  stable coin
    address[] public allTokenAddr;//All have a balance of the token address

    event FrozenFunds(address indexed target, bool frozen);

    /**
     *@param target Target address
     *@param policy The monetary policy used when stalizing coins
     *@param amount Change amount
     */
    event StableCoins(address indexed target, MonetaryPolicy policy,uint256 amount);


    function UstxToken() ERC20Token(initialSupply, tokenName, tokenSymbol,tokenDecimals) public {
        balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
        stabled[msg.sender] = 1;
        allTokenAddr.push(msg.sender);
    }

    function approveAndCall(address _spender,uint256 _value,bytes _extraData) public returns (bool success) {
        tokenRecipient spender = tokenRecipient(_spender);
        if(approve(_spender,_value)) {
            spender.receiveApproval(msg.sender,_value,this,_extraData);
            return true;
        }
    }

    function burn(uint256 _value) onlyOwner public {
        super.burn(_value);
    }

    function transfer(address _to, uint256 _value) accountFreezed(msg.sender) unhaltedOperation public returns (bool) {
        if(balanceOf[_to] == 0 && stabled[_to] != 1){
            stabled[_to] = 1;
            allTokenAddr.push(_to);
        }
        super.transfer(_to,_value);
    }
   /**
    * Freeze accounts and thaw accounts
    *  @param target address account address
    *  @param freeze bool Whether it is frozen
    *
   */
    function freezeAccount(address target,bool freeze) onlyOwner public {
        frozenAccount[target] = freeze;
        FrozenFunds(target, freeze);
    }

   //Determine whether the account is frozen
    modifier accountFreezed(address _to) {
        require(!frozenAccount[_to]);
        _;
    }


    function setExchangeRate(uint256 newExchangeRate) onlyOwner public {
        exchangeRate = newExchangeRate;
    }

    /*
    *shareToken to  stableToken
    */
    function stableCoins() onlyOwner public {
        for(uint256 i=0; i< allTokenAddr.length; i++){

            address addr = allTokenAddr[i];//
            uint256 balance = balanceOf[addr];

            // Proceed if and only if the user's balance is positive and the
            // coins haven't been stalized yet.
            if (balance > 0 && stabled[addr] == 1) {
                stabled[addr] = 2;
                uint256 oldBalance = balance;

                if (exchangeRate < 100) {
                    // Calculate the number of excess coins to burn.
                    uint256 newBalance = balance * exchangeRate / 100;
                    burn(addr, balance - newBalance);
                    StableCoins(addr, MonetaryPolicy.Contraction, balanceOf[addr]);
                } else if(exchangeRate > 100) {
                    // Calculate the number of new coins to mint.
                    uint256 _amount = (balance * exchangeRate / 100) - oldBalance;
                    mint(addr, _amount);
                    StableCoins(addr, MonetaryPolicy.Expansion, _amount);
                }

             }
         }
      }

      function halt() onlyOwner public {
          halted = true;
      }

      function unhalted() onlyOwner public {
          halted = false;
      }
    /**
    *Judge whether to suspend the operation
    */
    modifier unhaltedOperation() {
        require(!halted);
        _;
    }



}
