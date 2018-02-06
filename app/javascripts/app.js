// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import exampletoken_artifacts from '../../build/contracts/ExampleToken.json';
import clockauction_artifacts from '../../build/contracts/ClockAuction.json';

// ExampleToken is our usable abstraction, which we'll use through the code below.
var ExampleToken = contract(exampletoken_artifacts);
var ClockAuction = contract(clockauction_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var account2;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the ExampleToken abstraction for Use.
    ExampleToken.setProvider(web3.currentProvider);
    ClockAuction.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];
      account2 = accounts[1];

    });

    self.getBalance();
    self.getTokens();
  },

  getBalance: function() {
    var balance = document.getElementById("balance");
    ExampleToken.deployed().then(function(instance) {
      instance.balanceOf.call(account,{from: account}).then(function(x){
        balance.innerText = x;
      })
    })
  },

  getTokens: function() {
    var tokens = document.getElementById("tokens");
    ExampleToken.deployed().then(function(instance) {
      instance.tokensOf.call(account,{from: account}).then(function(x) {
        let tokenList = "";
        for(let i = 0;i < x.length; i++) {
          tokenList = tokenList + x[i] + " ";
        }

        tokens.innerText = tokenList;
      })
    })
  }
};

window.mintToken = function() {
  var input = document.getElementById("mintId").value;

  ExampleToken.deployed().then(function(instance) {
    return instance.mint(account,input,{from: account,gas: 1500000});
  });
}

window.burnToken = function() {
  var input = document.getElementById("burnId").value;

  ExampleToken.deployed().then(function(instance) {
    return instance.burn(input,{from: account,gas: 1500000});
  });
}

window.createAuction = function() {
  var id = document.getElementById("id").value;
  var sPrice = document.getElementById("startPrice").value;
  var ePrice = document.getElementById("endPrice").value;
  var duration = document.getElementById("duration").value;

  var durationInSeconds = duration * 24 * 60 * 60;

  ExampleToken.deployed().then((instance) => {
    ClockAuction.deployed().then((auction) => {
      instance.approve(auction.address,id,{from: account}).then(() => {
        return auction.createAuction(id,web3.toWei(sPrice, 'ether'),web3.toWei(ePrice, 'ether'),durationInSeconds,{from: account,gas: 1500000});
      })
  })
})
}

window.getAuction = function() {
  var id = document.getElementById("getId").value;
  var seller = document.getElementById("seller");
  var startPrice = document.getElementById("startPriceT");
  var currPrice = document.getElementById("currPriceT");
  var endPrice = document.getElementById("endPriceT");
  var duration = document.getElementById("durationT");
  var start = document.getElementById("start");

  ClockAuction.deployed().then((instance) => {
    instance.getAuction.call(id,{from: account}).then((auction) => {
      seller.innerText = auction[0];
      startPrice.innerText = web3.fromWei(auction[1], 'ether') + ' ETH';
      endPrice.innerText = web3.fromWei(auction[2], 'ether') + ' ETH';
      duration.innerText = auction[3];
      start.innerText = auction[4];

      if(account == auction[0]) {
        var cancel = document.getElementById("cancel");
        cancel.style.display = "block";
      }
    })

    instance.getCurrentPrice.call(id,{from: account}).then((price) => {
      currPrice.innerText = web3.fromWei(price, 'ether') + ' ETH';
    })
  })
}

window.cancelAuction = function() {
  var id = document.getElementById("id").value;

  ClockAuction.deployed().then((instance) => {
    instance.cancelAuction(id,{from: account,gas: 1500000}).then(() => {
      var cancel = document.getElementById("cancel");
      cancel.style.display = "none";
    })
  })
}

window.bid = function() {
  var id = document.getElementById("id").value;
  var bid = document.getElementById("bid").value;

  ClockAuction.deployed().then((instance) => {
    instance.bid(id,{from: account2,value: web3.toWei(bid,'ether'),gas: 1500000}).then(() => {

    })
  })
}



window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 ExampleToken, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
  }

  App.start();
});
