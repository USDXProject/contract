var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "code useful stadium trade visit announce spider width gorilla cruise grief skirt";
module.exports = {
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/dEz4xKQPah2D2lsp4Wvb")
      },
      network_id: 42,
      gas: 3970000

    }
  }
}
// module.exports = {
//   networks: {
//     development: {
//       host: '127.0.0.1',
//       port: 8545,
//       network_id: '*', // Match any network id
//         gas: 4992388
//     }
//   }
// }
