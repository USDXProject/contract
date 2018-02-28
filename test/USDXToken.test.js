/* global artifacts, contract, it, assert */
/* eslint-disable prefer-reflect */

const USDXToken = artifacts.require('USDXToken.sol');
const invalidAccount = '0x0';

contract('USDXToken', (accounts) => {

    let token = null;

    beforeEach(async function () {
        token = await USDXToken.new('USDX','USDX',0);
    });

  

});
