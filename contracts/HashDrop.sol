// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HashDrop {
    struct Drop {
        string id;
        string cid;
    }

    uint256 public dropCount = 0;
    mapping(string => address) public cidToAddress;
    mapping(string => string) public cidToPrivateCid;

    function add(string calldata cid) public payable {
        cidToAddress[cid] = msg.sender;
        dropCount++;
        // TODO: send a little eth to my wallet
    }

    function addPrivate(string calldata cid, string calldata pcid)
        public
        payable
    {
        cidToAddress[cid] = msg.sender;
        cidToPrivateCid[cid] = pcid;
        dropCount++;
        // TODO: send a little eth to my wallet
    }
}
