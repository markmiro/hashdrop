// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

/**
 * Stores data for the user. Primarily, all the user's hashdrops.
 */

contract User {
    mapping(address => string) public addressToRootCid;

    function set(string calldata cid) public payable {
        addressToRootCid[msg.sender] = cid;
    }
}
