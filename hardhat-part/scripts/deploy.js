const { ethers } = require("hardhat");

const main = async () => {
  const BlueMonkeyContract = await ethers.getContractFactory("BlueMonkey");
  const blueMonkeyContract = await BlueMonkeyContract.deploy(21000000);
  await blueMonkeyContract.deployed();

  console.log("BlueMonkey deployed to: ", blueMonkeyContract.address);

  const MarketContract = await ethers.getContractFactory("Market");
  const marketContract = await MarketContract.deploy(
    blueMonkeyContract.address
  );
  await marketContract.deployed();

  console.log("Market deployed to: ", marketContract.address);

  await blueMonkeyContract.transfer(marketContract.address, 10000000);
};

//BlueMonkey deployed to:  0xC88093436c6ca6367bE83b7eDb768039a85F71CB
//Market deployed to:  0xBAC0570C8C3c3675e48BCA25279C6b449319960d

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
