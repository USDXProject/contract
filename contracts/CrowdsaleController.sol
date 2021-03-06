pragma solidity ^0.4.17;
import './USDXToken.sol';

contract CrowdsaleController is USDXToken {
    uint256 public constant nativeDecimals = 18;//ether or bitcoin decimal

    mapping (address => bool) public whiteList;//Buyers whiteListing mapping

    bool public funding = true;// funding state
    uint256 public totalSaleAmount = 3 * (10**8) * (10**  decimals); // 0.3 billion USDX ever created test 16000
    uint256 public saleAmount = 0; //already purchased token
    uint256 public presaleAmount = 0;
    string public constant version = "0.1";

    bool public isRefund = false;//refund status
    // Crowdsale parameters
    uint256 public fundingStartBlock;
    uint256 public fundingEndBlock;
    uint256 public initialExchangeRate;

    // Founder Account
    address public founder = 0x0; // the contract creator's address

    // triggered when this contract is deployed
    event ContractCreated(address _this);
    // triggered when contribute successful
    event TokenPurchase(address indexed purchaser, address indexed beneficiary, uint256 value, uint256 amount);
    // triggered when refund successful
    event Refund(address indexed _from, uint256 _value);
    // triggered when crowdsale is over
    event Finalized(uint256 _time);

    modifier validAmount(uint256 _amount) {
        require(_amount > 0);
        _;
    }


    //Ensures only whiteListed address can buy tokens
    modifier onlyWhiteList(address _beneficiary) {
        require(whiteList[_beneficiary]);
        _;
    }

    function CrowdsaleController(
        uint256 _fundingStartBlock,
        uint256 _fundingEndBlock,
        uint256 _initialExchangeRate,
        uint256 _presaleAmount,
        string _name,
        string _symbol,
        uint256 _decimals)
    public
    USDXToken(_name, _symbol,_decimals)
    validAmount(_initialExchangeRate)
    {
        require(_fundingStartBlock >= block.number);
        require(_fundingEndBlock >= _fundingStartBlock);
        require(nativeDecimals >= _decimals);

        uint256 presaleAmountTokens = _presaleAmount * (10**decimals);
        require(presaleAmountTokens <= totalSaleAmount);
        founder = msg.sender;

        fundingStartBlock = _fundingStartBlock;
        fundingEndBlock = _fundingEndBlock;
        initialExchangeRate = _initialExchangeRate;
        presaleAmount = _presaleAmount;

        mintByPurchaser(founder, presaleAmountTokens);
        ContractCreated(address(this));
    }

    function ()
    external
    payable
    {
        contribute(msg.sender);
    }


    function contribute(address _beneficiary)
    public
    payable
    onlyWhiteList(_beneficiary)
    validAmount(msg.value)
    {
        require(_beneficiary != address(0));
        require(block.number >= fundingStartBlock);
        require(block.number <= fundingEndBlock);
        uint256 tokenAmount = getTokenExchangeAmount(msg.value, initialExchangeRate, nativeDecimals,decimals);

        uint256 checkSupply = safeAdd(saleAmount,tokenAmount);

        // Ensure new token increment does not exceed the sale amount
        assert(checkSupply <= totalSaleAmount);

        mintByPurchaser(_beneficiary,tokenAmount);
        saleAmount = safeAdd(saleAmount,tokenAmount);
        TokenPurchase(msg.sender, _beneficiary, msg.value, tokenAmount);

        // Transfer ETH to the founder address.
        founder.transfer(msg.value);
    }
    //batch add whiteList
    function whiteListAccounts(address[] _batchOfAddresses) public onlyOwner returns (bool success) {
        for(uint256 i=0; i<_batchOfAddresses.length; i++){
            whiteList[_batchOfAddresses[i]] = true;
        }
        return true;
    }

    function finalize()
    onlyOwner
    public
    {

        require(funding);
        require(block.number >= fundingEndBlock);

        funding = false;
        // Create additional USDX for the USDX Factory and developers as
        // the 18% of total number of tokens.
        // All additional tokens are transfered to the account controller by
        // USDXAllocation contract which will not allow using them for 6 months.

        //uint256 additionalTokens = safeMul(totalSupply, founderPercentOfTotal) / (100 - founderPercentOfTotal);
        //totalSupply = safeAdd(totalSupply, additionalTokens);
        //balanceOf[founder] = safeAdd(balanceOf[founder], additionalTokens);
        uint256 additionalTokens = safeSub(totalSupply,totalSaleAmount);
        uint256 finalAdditionsTokens = safeSub(additionalTokens,presaleAmount);
        balanceOf[founder] = safeAdd(balanceOf[founder], finalAdditionsTokens);
        Transfer(0, founder,finalAdditionsTokens);

        Finalized(now);

        // Transfer ETH to the founder address.
        founder.transfer(this.balance);



    }
    /**
     *  @notice Shows the amount of USDX the user will receive for amount of exchanged wei
     * @param _weiAmount Exchanged wei amount to convert
     * @param _tokenContributionRate Number of USDX per exchange token
     * @param _nativeDecimals Number of decimals of the token being exchange for USDX
     * @param _decimals Number of decimals of USDX token
     * @return The amount of USDX that will be received
     */
    function getTokenExchangeAmount(
        uint256 _weiAmount,
        uint256 _tokenContributionRate,
        uint256 _nativeDecimals,
        uint256 _decimals)
    public
    pure
    returns(uint256)
    {
        require(_weiAmount >0);
        /* uint256 totalToken =0;

        uint256 differenceFactor = (10**_nativeDecimals) / (10**_decimals);

        totalToken = safeMul(_weiAmount,_tokenContributionRate) / differenceFactor;
        if(_weiAmount < (500 * 10**_nativeDecimals)){// < 500ether

        }else if(_weiAmount < (1000 * 10**_nativeDecimals)){//<=500ether and >1000ether
            totalToken +=  totalToken / 10 + (_weiAmount * 888) / differenceFactor;
        }else{//>= 1000 ether
            totalToken +=  (totalToken*25)/100 + (_weiAmount * 6666) / differenceFactor;
        }
        return totalToken; */
        uint256 differenceFactor = (10**_nativeDecimals) / (10**_decimals);
        return  safeMul(_weiAmount,_tokenContributionRate) / differenceFactor;
    }

    function setIsRefund(bool refundStatus)
    onlyOwner
    public
    {
      isRefund = refundStatus;
    }

    function refund()
    public
    {
      require(block.number >= fundingEndBlock);
      require(isRefund);
      uint256 tokenAmount = balanceOf[msg.sender];
      assert(tokenAmount > 0);

      balanceOf[msg.sender] = 0;


      uint256 refundValue = tokenAmount / initialExchangeRate;
      Refund(msg.sender, refundValue);
      msg.sender.transfer(refundValue);
      /* assert */
    }

    function mintByPurchaser(address _to,uint256 _amount)
    private
    returns (bool)
    {
      balanceOf[_to] = safeAdd(balanceOf[_to], _amount);
    }

}
