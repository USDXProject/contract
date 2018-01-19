pragma solidity ^0.4.17;
import './MintableToken.sol';
import './BurnableToken.sol';


interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public; }
/**
 * @title The final Ustx token
 */
contract UstxToken  is MintableToken,BurnableToken {


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
    *@param target  target address
    *@param stabled  1->decrease amount  2->increase
    *@param amount  Change amount
    */
    event StableCoins(address indexed target, uint8 stabled,uint256 amount);


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
        uint256 burnTotalToken;
        for(uint256 i=0; i< allTokenAddr.length; i++){

            address addr = allTokenAddr[i];//
            uint256 balance = balanceOf[addr];
            if(balance >0 && stabled[addr] == 1){//用户账户余额大于零 且 还未成为稳定币

                stabled[addr] = 2;
                uint256 oldBalance = balance;

                if(exchangeRate <100){//多余的代币
                    burnTotalToken += (oldBalance - balanceOf[addr]);
                    balanceOf[addr] = balance * exchangeRate /100;
                    StableCoins(addr,1,(oldBalance - balanceOf[addr]));
                }else if(exchangeRate >100){//挖矿 增加代币
                    uint256 _amount = (balance * exchangeRate /100) - oldBalance;
                    mint(addr, _amount);
                    StableCoins(addr,2,_amount);
                }

             }
         }
         //Destroy the excess token
         if(burnTotalToken >0){
             burn(burnTotalToken);
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
