// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

contract HashDrop {
    string[] public cids;
    mapping(string => address) public cidToAddress;
    mapping(string => string) public cidToPrivateCid;

    function add(string calldata cid) public payable {
        cidToAddress[cid] = msg.sender;
        cids.push(cid);
        // TODO: send a little eth to my wallet
    }

    function dropCount() public view returns (uint256) {
        return cids.length;
    }

    function cidAt(uint256 index) public view returns (string memory) {
        return cids[index];
    }

    function addPrivate(string calldata cid, string calldata pcid)
        public
        payable
    {
        cidToAddress[cid] = msg.sender;
        cidToPrivateCid[cid] = pcid;
        cids.push(cid);
        // TODO: send a little eth to my wallet
    }
}
