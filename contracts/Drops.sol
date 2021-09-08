// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

contract Drops {
    mapping(address => string) public addressToRootCid;

    function set(string calldata cid) public payable {
        addressToRootCid[msg.sender] = cid;
    }
}
