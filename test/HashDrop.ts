import { ethers } from "hardhat";
import { expect } from "chai";
import { HashDrop as T } from "../frontend/src/typechain";
import { ipfsCid } from "../frontend/src/util/ipfsCid";
import { textToBlob } from "../frontend/src/util/textToBlob";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("HashDrop", () => {
  let HashDrop,
    hashdrop,
    owner: SignerWithAddress,
    acc1: SignerWithAddress,
    acc2: SignerWithAddress;

  beforeEach(async () => {
    HashDrop = await ethers.getContractFactory("HashDrop");
    [owner, acc1, acc2] = await ethers.getSigners();
    hashdrop = await HashDrop.deploy();
  });

  it("should increase drop count", async () => {
    const HashDrop = await ethers.getContractFactory("HashDrop");
    const hashdrop = (await HashDrop.deploy()) as T;

    const numStart = (await hashdrop.dropCount()).toNumber();
    const cid = "bafybeid3weurg3gvyoi7nisadzolomlvoxoppe2sesktnpvdve3256n5tq";
    await hashdrop.add(cid);
    const numEnd = (await hashdrop.dropCount()).toNumber();
    expect(numEnd - numStart).equal(1);
  });
});
