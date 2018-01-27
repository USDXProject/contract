pragma solidity ^0.4.17;
import './USDXToken.sol';
import "./USDXAllocation.sol";

contract CrowdsaleController is USDXToken {
    uint256 public constant nativeDecimals = 18;//ether or bitcoin decimal

    uint256 public saleAmount = 1600 * (10**3) * (10**  decimals); // 1.6 billion USTX ever created

    string public constant version = "0.1";

    bool public funding = true; // funding state

    // Crowdsale parameters
    uint256 public fundingStartBlock;
    uint256 public fundingEndBlock;
    uint256 public initialExchangeRate;

    uint8 public founderPercentOfTotal = 0; // should between 0 to 99
    // Receives ETH and its own GNT endowment.
    address public founder = 0x0; // the contract creator's address

    USDXAllocation lockedAllocation;
    // The current total token supply.
    uint256 totalTokens;

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

    //Set ICO start block, end block, exchange rate, minimum target, maximum target, tokens, symbols
    function CrowdsaleController(
        uint256 _fundingStartBlock,
        uint256 _fundingEndBlock,
        uint256 _initialExchangeRate,
        uint256 _presaleAmount,
        uint8 _founderPercentOfTotal,
        string _name,
        string _symbol,
        uint256 _decimals)
    public
    USDXToken(_name, _symbol,_decimals)
    validAmount(_founderPercentOfTotal)
    validAmount(_presaleAmount)
    validAmount(_initialExchangeRate)
    validAmount(100 - _founderPercentOfTotal)
    {
        require(_fundingStartBlock >= block.number);
        require(_fundingEndBlock >= _fundingStartBlock);
        require(nativeDecimals >= _decimals);

        uint256 presaleAmountTokens = _presaleAmount * (10**decimals);
        require(presaleAmountTokens <= saleAmount);
        founder = msg.sender;


        fundingStartBlock = _fundingStartBlock;
        fundingEndBlock = _fundingEndBlock;
        initialExchangeRate = _initialExchangeRate;
        founderPercentOfTotal = _founderPercentOfTotal;

        lockedAllocation = new USDXAllocation(founder);
        //Mint the presale tokens, distribute to a receiver
        mint(owner,presaleAmountTokens);

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
    validAmount(msg.value)
    {

        require(_beneficiary != address(0));
        require(block.number >= fundingStartBlock);
        require(block.number <= fundingEndBlock);

        uint256 tokenAmount = getTokenExchangeAmount(msg.value, initialExchangeRate, nativeDecimals,decimals);
        uint256 checkedSupply = safeAdd(totalSupply,tokenAmount);

        // Ensure new token increment does not exceed the sale amount
        assert(checkedSupply <= saleAmount);

        mintByPurchaser(_beneficiary,tokenAmount);
        TokenPurchase(msg.sender, _beneficiary, msg.value, tokenAmount);

        owner.transfer(msg.value);
    }


    function finalize()
    onlyOwner
    public
    {
        assert(funding);
        assert(block.number >= fundingEndBlock);// && totalSupply >= tokenContributionMin

        funding = false;
        // Create additional USTX for the USTX Factory and developers as
        // the 18% of total number of tokens.
        // All additional tokens are transfered to the account controller by
        // USDXAllocation contract which will not allow using them for 6 months.

        uint256 additionalTokens =
        safeMul(totalSupply, founderPercentOfTotal) / (100 - founderPercentOfTotal);
        totalSupply = safeAdd(totalSupply, additionalTokens);
        balanceOf[lockedAllocation] = safeAdd(balanceOf[lockedAllocation], additionalTokens);
        Transfer(0, lockedAllocation, additionalTokens);
        Finalized(now);

        // Transfer ETH to the Ustx Factory address.
        founder.transfer(this.balance);



    }
    /**
     *  @notice Shows the amount of USTX the user will receive for amount of exchanged wei
     * @param _weiAmount Exchanged wei amount to convert
     * @param _tokenContributionRate Number of USTX per exchange token
     * @param _nativeDecimals Number of decimals of the token being exchange for USTX
     * @param _decimals Number of decimals of USTX token
     * @return The amount of USTX that will be received
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

    function mintByPurchaser(address _to,uint256 _amount)
    private
    returns (bool)
    {
        return mintCrowdSale(_to,_amount);
    }
}
