let bluebird = require('bluebird');

function Config(web3) {
    return {
        startBlock: 2742083,
        endBlock: 2742983,
        initialExchangeRate: 100,
        presaleAmount: 16e3, // 30 million presale tokens
        founderPercentOfTotal:18,
        name:'USDX',
        symbol:'USDX',
        decimals:8
    }
};

module.exports = Config;
