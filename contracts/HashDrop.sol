// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashDrop {
    struct Drop {
        string id;
        string cid;
    }

    uint256 public dropCount = 0;
    mapping(string => address) public dropToAddress;
    mapping(string => string) public dropToPrivateDrop;

    function add(string calldata cid) public payable {
        dropToAddress[cid] = msg.sender;
        dropCount++;
        // TODO: send a little eth to my wallet
    }

    function addPrivate(string calldata cid, string calldata pcid)
        public
        payable
    {
        dropToAddress[cid] = msg.sender;
        dropToPrivateDrop[cid] = pcid;
        dropCount++;
        // TODO: send a little eth to my wallet
    }
}
