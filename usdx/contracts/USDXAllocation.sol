pragma solidity ^0.4.17;
import "./USDXToken.sol";

/// @title USTX Allocation - Time-locked vault of tokens allocated
/// to developers and company
contract USDXAllocation {

    uint256 constant totalAllocations = 30000;

    mapping (address => uint256) allocations;

    USDXToken ustx;
    uint256 unlockedAt;

    uint256 tokensCreated = 0;

    function USDXAllocation(address _ustxFactory)
    public
    {
        ustx =  USDXToken(msg.sender);
        unlockedAt = now + 6 * 30 days;

        //For the Ustx Factory;
        allocations[_ustxFactory] = 20000;

        // For developers:
        allocations[0x7778c48a49cf2750d7cac060cbea9ea4c0121606] = 2500; // 25.0% of developers' allocations (10000).
        allocations[0xe663011dd078c7002a9339ad461d57220d58269f] =  730; //  7.3% of developers' allocations.
        allocations[0x872ea08fdf316de23588ff70b19756c072abcead] =  730;
        allocations[0x20421b1ab92bbd3a21413ae1d93a385e95b6dd04] =  730;
        //allocations[0x95e337d09f1bc67681b1cab7ed1125ea2bae5ca8] =  730;
        allocations[0x0025C58dB686b8CEce05CB8c50C1858b63Aa396E] =  730;
        allocations[0xB127FC62dE6ca30aAc9D551591daEDdeBB2eFD7A] =  630; //  6.3% of developers' allocations.
        allocations[0x21AF2E2c240a71E9fB84e90d71c2B2AddE0D0e81] =  630;
        allocations[0x682AA1C3b3E102ACB9c97B861d595F9fbfF0f1B8] =  630;
        allocations[0x6edd429c77803606cBd6Bb501CC701a6CAD6be01] =  630;
        allocations[0x5E455624372FE11b39464e93d41D1F6578c3D9f6] =  310; //  3.1% of developers' allocations.
        allocations[0xB7c7EaD515Ca275d53e30B39D8EBEdb3F19dA244] =  138; //  1.38% of developers' allocations.
        allocations[0xD513b1c3fe31F3Fe0b1E42aa8F55e903F19f1730] =  135; //  1.35% of developers' allocations.
        allocations[0x70cac7f8E404EEFce6526823452e428b5Ab09b00] =  100; //  1.0% of developers' allocations.
        //allocations[0xe0d5861e7be0fac6c85ecde6e8bf76b046a96149] =  100;
        allocations[0x17488694D2feE4377Ec718836bb9d4910E81D9Cf] =  100;
        allocations[0xb481372086dEc3ca2FCCD3EB2f462c9C893Ef3C5] =  100;
        allocations[0xFB6D91E69CD7990651f26a3aa9f8d5a89159fC92] =   70; //  0.7% of developers' allocations.
        allocations[0xE2ABdAe2980a1447F445cb962f9c0bef1B63EE13] =   70;
        allocations[0x729A5c0232712caAf365fDd03c39cb361Bd41b1C] =   70;
        allocations[0x12FBD8fef4903f62e30dD79AC7F439F573E02697] =   70;
        allocations[0x657013005e5cFAF76f75d03b465cE085d402469A] =   42; //  0.42% of developers' allocations.
        allocations[0xD0AF9f75EA618163944585bF56aCA98204d0AB66] =   25; //  0.25% of developers' allocations.
        /**/
    }

    function unlock()
    external
    {
        require(now > unlockedAt);

        if(tokensCreated == 0)
            tokensCreated = ustx.balanceOf(this);

        var allocation = allocations[msg.sender];
        allocations[msg.sender] = 0;
        var toTransfer = tokensCreated * allocation / totalAllocations;

        ustx.transfer(msg.sender,toTransfer);

    }

}
