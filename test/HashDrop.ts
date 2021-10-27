import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HashDrop as T } from "../frontend/src/typechain";
const Hash = require("ipfs-only-hash");

describe("HashDrop", async () => {
  let HashDrop, hashdrop: T, owner: SignerWithAddress;

  const cid1 = await Hash.of("lorem ipsum 1", {
    cidVersion: 1,
    rawLeaves: true,
  });
  const cid2 = await Hash.of("lorem ipsum 2", {
    cidVersion: 1,
    rawLeaves: true,
  });

  beforeEach(async () => {
    HashDrop = await ethers.getContractFactory("HashDrop");
    [owner] = await ethers.getSigners();
    hashdrop = (await HashDrop.deploy()) as T;
  });

  it("should add a drop", async () => {
    const tx = await hashdrop.add(cid1);
    await tx.wait();
    const ethCid = await hashdrop.cidToAddress(cid1);
    expect(ethCid).equal(owner.address);
  });

  it("should increase drop count", async () => {
    const numStart = (await hashdrop.dropCount()).toNumber();

    const tx = await hashdrop.add(cid2);
    await tx.wait();

    const numEnd = (await hashdrop.dropCount()).toNumber();
    expect(numEnd - numStart).equal(1);
  });

  it("should return latest drops", async () => {
    const tx1 = await hashdrop.add("cid1");
    await tx1.wait();
    const tx2 = await hashdrop.add("cid2");
    await tx2.wait();

    const count = (await hashdrop.dropCount()).toNumber();
    console.log({ count });
    expect(count).eq(2);

    expect(await hashdrop.cids("0")).equal("cid1");
    expect(await hashdrop.cids("1")).equal("cid2");
  });
});
