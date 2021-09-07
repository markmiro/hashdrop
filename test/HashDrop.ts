import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { HashDrop as T } from "../frontend/src/typechain";
const Hash = require("ipfs-only-hash");

describe("HashDrop", () => {
  let HashDrop,
    hashdrop: T,
    owner: SignerWithAddress,
    acc1: SignerWithAddress,
    acc2: SignerWithAddress;

  beforeEach(async () => {
    HashDrop = await ethers.getContractFactory("HashDrop");
    [owner, acc1, acc2] = await ethers.getSigners();
    hashdrop = (await HashDrop.deploy()) as T;
  });

  it("should increase drop count", async () => {
    const numStart = (await hashdrop.dropCount()).toNumber();

    const text = "lorem ipsum";
    const cid = await Hash.of(text, { cidVersion: 1, rawLeaves: true });
    await hashdrop.add(cid);

    const numEnd = (await hashdrop.dropCount()).toNumber();
    expect(numEnd - numStart).equal(1);
  });
});
