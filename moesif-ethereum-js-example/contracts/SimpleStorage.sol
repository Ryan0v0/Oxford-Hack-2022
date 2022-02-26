pragma solidity ^0.5.16;

contract SimpleStorage {
  uint storedData;

  event Hello(string name);
  event Deposit(address indexed from, uint value);

  function set(uint x) public {
    storedData = x;
    emit Deposit(msg.sender, x);
    emit Hello("world");
  }

  function get() public view returns (uint) {
    return storedData;
  }
}
