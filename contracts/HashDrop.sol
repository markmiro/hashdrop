// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashDrop {
    struct Drop {
        string id;
        string cid;
    }

    uint256 public numDrops = 0;
    mapping(string => Drop) public idToDrop;
    mapping(string => address) public dropToAddress;
    mapping(address => Drop[]) public addressToDrops;

    function add(Drop calldata drop) public payable {
        idToDrop[drop.id] = drop;
        dropToAddress[drop.cid] = msg.sender;
        addressToDrops[msg.sender].push(drop);
        numDrops++;
        // TODO: send a little eth to my wallet
    }
}
