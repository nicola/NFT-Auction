var ExampleToken = artifacts.require("./ExampleToken.sol");
var ClockAuction = artifacts.require("./ClockAuction.sol");

module.exports = function(deployer) {
  deployer.deploy(ExampleToken)
  .then(() => ExampleToken.deployed())
  .then(instance => deployer.deploy(ClockAuction, instance.address))
};