const { Web3Provider } = require("@ethersproject/providers");
const { expect, waffle } = require("chai");
const { utils, BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("Market test", function () {
  let MarketContract, marketContract, BlueMonkeyContract, blueMonkeyContract;
  beforeEach(async () => {
    BlueMonkeyContract = await ethers.getContractFactory("BlueMonkey");
    blueMonkeyContract = await BlueMonkeyContract.deploy(21000000);
    await blueMonkeyContract.deployed();

    MarketContract = await ethers.getContractFactory("Market");
    marketContract = await MarketContract.deploy(blueMonkeyContract.address);
    await marketContract.deployed();

    blueMonkeyContract.transfer(marketContract.address, 21000000);
  });
  describe("Tests the market contract", () => {
    it("Lets the user buy", async () => {
      let contractBalance = await ethers.provider.getBalance(
        marketContract.address
      );
      expect(contractBalance.toString()).to.equal("0");
      const tx = await marketContract.buy(1000, {
        value: ethers.utils.parseEther("1"),
      });
      await tx.wait();
      const [deployer] = await ethers.getSigners();
      const balance = await blueMonkeyContract.balanceOf(deployer.address);
      expect(balance.toString()).to.equal("1000");

      contractBalance = await ethers.provider.getBalance(
        marketContract.address
      );
      contractBalance = utils.formatEther(contractBalance);
      expect(contractBalance.toString()).to.equal("1.0");
    });
    it("lets the user sell", async () => {
      const [deployer] = await ethers.getSigners(0);
      const tx = await marketContract.buy(1000, {
        value: ethers.utils.parseEther("1"),
      });
      await tx.wait();
      await blueMonkeyContract.approve(
        marketContract.address,
        1000
        //ethers.utils.parseEther("1")
      );
      const tx1 = await marketContract.sell(1000);
      await tx1.wait();
      const balance = await blueMonkeyContract.balanceOf(deployer.address);
      expect(balance.toString()).to.equal("0");
    });
    it("lets the owner withdraw the eth from contract", async () => {
      const [deployer, user1, user2] = await ethers.getSigners();
      const tx = await marketContract
        .connect(user1)
        .buy(1000, { value: ethers.utils.parseEther("1") });
      await tx.wait();
      const tx1 = await marketContract
        .connect(user2)
        .buy(1000, { value: ethers.utils.parseEther("1") });
      await tx1.wait();
      let balance = await ethers.provider.getBalance(marketContract.address);
      balance = utils.formatEther(balance);
      expect(balance.toString()).to.equal("2.0");
      const tx2 = await marketContract.withdraw();
      await tx2.wait();
      balance = await ethers.provider.getBalance(marketContract.address);
      expect(balance.toString()).to.equal("0");
    });
    it("gives the token balance of the user", async () => {
      const [deployer, user1, user2] = await ethers.getSigners();
      const tx = await marketContract
        .connect(user1)
        .buy(1000, { value: ethers.utils.parseEther("1") });
      await tx.wait();
      const balance = await blueMonkeyContract.balanceOf(user1.address);
      expect(balance.toString()).to.equal("1000");
    });
    it("Shows the right price", async () => {
      const tx = await marketContract.getTotalPrice("2000");
      expect(tx.toString()).to.equal("2000000000000000000");
    });
    it("emits an event after someone bought", async () => {
      const [deployer] = await ethers.getSigners(0);
      await expect(
        marketContract.buy(1000, {
          value: ethers.utils.parseEther("1"),
        })
      )
        .to.emit(marketContract, "BuyEnd")
        .withArgs(deployer.address, 1000);
    });
    it("emit an event after someone sold", async () => {
      const [deployer] = await ethers.getSigners(0);

      const tx = await marketContract.buy(1000, {
        value: ethers.utils.parseEther("1"),
      });
      await tx.wait();
      await blueMonkeyContract.approve(
        marketContract.address,
        ethers.utils.parseEther("1")
      );
      await expect(marketContract.sell(1000))
        .to.emit(marketContract, "SellEnd")
        .withArgs(deployer.address, 1000);
    });
  });
});
