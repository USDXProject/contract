let bluebird = require('bluebird');

function Config(web3) {
    return {
        startBlock: 251,
        endBlock: 259,
        initialExchangeRate: 100,
        presaleAmount: 1e8, // 30 million presale tokens
        name:'USDX',
        symbol:'USDX',
        decimals:8
    }
};

module.exports = Config;
