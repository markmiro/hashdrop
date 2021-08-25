import { ethers } from "hardhat";
import { expect } from "chai";
import { HashDrop as T } from "../frontend/src/typechain";

describe("HashDrop", () => {
  it("should return the expected message", async () => {
    const HashDrop = await ethers.getContractFactory("HashDrop");
    const hashdrop = (await HashDrop.deploy()) as T;
    const numStart = (await hashdrop.numDrops()).toNumber();
    await hashdrop.add({
      id: "234234234",
      cid: "",
    });
    const numEnd = (await hashdrop.numDrops()).toNumber();
    expect(numEnd - numStart).equal(1);
  });
});
