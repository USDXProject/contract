let bluebird = require('bluebird');

function Config(web3) {
    return {
        startBlock: 170,
        endBlock: 199,
        initialExchangeRate: 100,
        presaleAmount: 16e3, // 30 million presale tokens
        founderPercentOfTotal:18,
        name:'USDX',
        symbol:'USDX',
        decimals:8
    }
};

module.exports = Config;
