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

    // Enum that indicates the status of coins. Share means the coins have
    // not been pegged. After the initial pegging, coins status will turn to
    // Stable. This process is irreversible. Initial is the state when the
    // account is first activated with no coin balance.
    enum CoinStatus { Initial, Share, Stable }

    string public constant tokenName = "USTX";//token name
    string public constant tokenSymbol = "USTX";//token symbol
    //uint256 public initialSupply = 2*10**9;// initial total amount
    //uint8 public constant tokenDecimals = 8;

    uint256 public initialSupply = 3000;// initial total amount
    uint8 public constant tokenDecimals = 0;
    uint256 public tokenTotalSupply = 20 * (10**3) * (10**  decimals); // 2 billion USTX ever created


    uint256 public stabledRate;//Exchange rate
    mapping (address => bool) public frozenAccount;//Whether or not to freeze a list of accounts
    mapping (address => CoinStatus) public coinStatus;
    address[] public allTokenAddr;//All have a balance of the token address

    event MintCrowdSale(uint256 supply, address indexed to, uint256 amount);
    event FrozenFunds(address indexed target, bool frozen);

    /**
     *@param target Target address
     *@param policy The monetary policy used when stalizing coins
     *@param amount Change amount
     */
    event StableCoins(address indexed target, MonetaryPolicy policy,uint256 amount);

    function UstxToken(
        string _name,
        string _symbol,
        uint256 _decimals)
    ERC20Token(_name, _symbol,_decimals)
    public {
        //balanceOf[msg.sender] = totalSupply;
        owner = msg.sender;
        coinStatus[msg.sender] = CoinStatus.Share;
        allTokenAddr.push(msg.sender);
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

    function burn(uint256 _value)
    onlyOwner
    public
    {
        super.burn(_value);
    }

    function transfer(address _to, uint256 _value)
    accountFreezed(msg.sender)
    public
    returns (bool) {
        recordAddress(_to);
        super.transfer(_to, _value);
    }

    function transferFrom(address _from, address _to, uint256 _value)
    accountFreezed(msg.sender)
    public
    returns (bool)
    {
        recordAddress(_to);
        super.transferFrom(_from, _to, _value);
    }

    function recordAddress(address _to)
    validAddress(_to)
    private
    {
        // If the _to address is in Initial status and has no balance, then add
        // it to the list of addresses.
        if (balanceOf[_to] == 0 && coinStatus[_to] == CoinStatus.Initial){
            coinStatus[_to] = CoinStatus.Share;
            allTokenAddr.push(_to);
        }
    }
    /// @dev Mint new tokens (only crowdsale used)
    /// @param _to Address to mint the tokens to
    /// @param _amount Amount of tokens that will be minted
    /// @return Boolean to signify successful minting
    function mintCrowdSale(address _to, uint256 _amount)
    internal
    returns (bool)
    {
        uint256 checkedSupply = safeAdd(totalSupply,_amount);
        require(checkedSupply <= tokenTotalSupply);

        totalSupply += _amount;
        balanceOf[_to] = safeAdd(balanceOf[_to],_amount);

        MintCrowdSale(totalSupply, _to, _amount);

        return true;
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

   //Determine whether the account is frozen
    modifier accountFreezed(address _to)
    {
        require(!frozenAccount[_to]);
        _;
    }


    function setStabledRate(uint256 newStabledRate)
    onlyOwner
    public
    {
        stabledRate = newStabledRate;
    }

    /*
    *shareToken to  stableToken
    */
    function stableCoins()
    onlyOwner
    public
    {
        for(uint256 i=0; i< allTokenAddr.length; i++){

            address addr = allTokenAddr[i];
            uint256 balance = balanceOf[addr];

            // Proceed if and only if the user's balance is positive and the
            // coins haven't been stalized yet.
            if (balance > 0 && coinStatus[addr] == CoinStatus.Share) {
                coinStatus[addr] = CoinStatus.Stable;
                uint256 oldBalance = balance;

                if (stabledRate < 100) {
                    // Calculate the number of excess coins to burn.
                    uint256 newBalance = balance * stabledRate / 100;
                    burn(addr, balance - newBalance);
                    StableCoins(addr, MonetaryPolicy.Contraction, balanceOf[addr]);
                } else if(stabledRate > 100) {
                    // Calculate the number of new coins to mint.
                    uint256 _amount = (balance * stabledRate / 100) - oldBalance;
                    mint(addr, _amount);
                    StableCoins(addr, MonetaryPolicy.Expansion, _amount);
                }

             }
         }
      }
}
