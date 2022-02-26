var SimpleVoting = artifacts.require("SimpleVoting");

module.exports = function(deployer) {
  deployer.deploy(SimpleVoting);
};