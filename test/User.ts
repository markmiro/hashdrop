import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert } from "chai";
import { ethers } from "hardhat";
import { User as UserT } from "../frontend/src/typechain";
const Hash = require("ipfs-only-hash");

describe("User", () => {
  let User,
    user: UserT,
    owner: SignerWithAddress,
    acc1: SignerWithAddress,
    acc2: SignerWithAddress;

  beforeEach(async () => {
    [owner, acc1, acc2] = await ethers.getSigners();

    User = await ethers.getContractFactory("Drops");
    user = (await User.deploy()) as UserT;
  });

  it("should set root drops cid", async () => {
    const text = "Lorem ipsum";

    const cid = await Hash.of(JSON.stringify(text), {
      cidVersion: 1,
      rawLeaves: true,
    });

    const json = {
      address: acc1.address,
      drops: [{ cid }],
    };

    const rootCid = await Hash.of(JSON.stringify(json), {
      cidVersion: 1,
      rawLeaves: true,
    });

    await user.connect(acc1).set(rootCid);

    const ethRootCid = await user.addressToRootCid(acc1.address);

    assert.equal(rootCid, ethRootCid);
  });
});
