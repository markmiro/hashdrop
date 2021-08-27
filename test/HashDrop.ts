import { ethers } from "hardhat";
import { expect } from "chai";
import { HashDrop as T } from "../frontend/src/typechain";

describe("HashDrop", () => {
  let HashDrop, hashdrop, owner, acc1, acc2;

  beforeEach(async () => {
    HashDrop = await ethers.getContractFactory("HashDrop");
    [owner, acc1, acc2] = await ethers.getSigners();
    hashdrop = await HashDrop.deploy();
  });

  it("should return the expected message", async () => {
    const HashDrop = await ethers.getContractFactory("HashDrop");
    const hashdrop = (await HashDrop.deploy()) as T;

    const numStart = (await hashdrop.dropCount()).toNumber();
    const cid = "bafybeid3weurg3gvyoi7nisadzolomlvoxoppe2sesktnpvdve3256n5tq";
    await hashdrop.add(cid);
    const numEnd = (await hashdrop.dropCount()).toNumber();
    expect(numEnd - numStart).equal(1);
  });
});
