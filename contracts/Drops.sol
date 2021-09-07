// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Drops {
    mapping(address => string) public addressToRootCid;

    function set(string calldata cid) public payable {
        addressToRootCid[msg.sender] = cid;
    }
}
