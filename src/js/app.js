App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    //$.getJSON('USDXToken.json', function(data) {
    $.getJSON('TestERC20Token.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var USDXArtifact = data;
      App.contracts.USDXToken = TruffleContract(USDXArtifact);

      // Set the provider for our contract.
      App.contracts.USDXToken.setProvider(App.web3Provider);

      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#USDXTransferAmount').val());
    var toAddress = $('#USDXTransferAddress').val();

    console.log('Transfer ' + amount + ' USDX to ' + toAddress);

    var usdxTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.USDXToken.deployed().then(function(instance) {
        usdxTokenInstance = instance;

        return usdxTokenInstance.transfer(toAddress, amount, {from: account});
      }).then(function(result) {
        alert('Transfer Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalances: function(adopters, account) {
    console.log('Getting balances...');

    var usdxTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      console.log("account = " + account);

      App.contracts.USDXToken.deployed().then(function(instance) {
        usdxTokenInstance = instance;
        console.log(usdxTokenInstance);

        return usdxTokenInstance.balanceOf(account);
        //return usdxTokenInstance.totalSupply();
      }).then(function(result) {
        balance = result.c[0];
        console.log("result = " + result);
        console.log("balance = " + balance);

        $('#USDXBalance').text(balance);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
