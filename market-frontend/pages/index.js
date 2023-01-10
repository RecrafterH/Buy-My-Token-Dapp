import Head from "next/head";
import { Contract, ethers } from "ethers";

import { Inter } from "@next/font/google";
import styles from "../styles/Home.module.css";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  useColorMode,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import ToggleModeBtn from "../components/ToggleMode";
import {
  MARKET_CONTRACT_ADDRESS,
  MARKET_CONTRACT_ABI,
  BLUEMONKEY_ADDRESS,
  BLUEMONKEY_ABI,
} from "../constant/constants";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [tokenPriceValue, settokenPriceValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenBalance, setTokenBalance] = useState("");
  const [ethBalance, setEthBalance] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const buyToken = async () => {
    try {
      //const value = document.getElementById("inputField").value;
      //console.log(tokenValue);
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const marketContract = new Contract(
        MARKET_CONTRACT_ADDRESS,
        MARKET_CONTRACT_ABI,
        signer
      );
      const tokenValue = document.getElementById("inputField").value;
      console.log(tokenValue);
      const costs = await marketContract.getTotalPrice(tokenValue);
      const cost = ethers.utils.formatEther(costs.toString());
      console.log(cost);
      const tx = await marketContract.buy(tokenValue, {
        value: costs.toString(),
      });

      setLoading(true);
      await tx.wait();
      setLoading(false);
      getTokenBalance();
      getEthBalance();
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const givePrice = async (value) => {
    try {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const marketContract = new Contract(
        MARKET_CONTRACT_ADDRESS,
        MARKET_CONTRACT_ABI,
        provider
      );

      const balance = await marketContract.getTotalPrice(value);
      const price = ethers.utils.formatEther(balance.toString());
      settokenPriceValue(price);
      console.log(price);
    } catch (error) {
      console.error(error);
    }
  };

  const getTokenBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const monkeyContract = new Contract(
        BLUEMONKEY_ADDRESS,
        BLUEMONKEY_ABI,
        provider
      );
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await monkeyContract.balanceOf(address);
      const balance1 = balance.toString();
      setTokenBalance(balance1);
    } catch (error) {
      console.error(error);
    }
  };

  const getEthBalance = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      console.log(address);
      let balance = await await provider.getBalance(address);
      balance = ethers.utils.formatEther(balance.toString());
      balance = Math.round(balance * 1000) / 1000;
      setEthBalance(balance);
    } catch (error) {
      console.error(error);
    }
  };

  const sellToken = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const marketContract = new Contract(
        MARKET_CONTRACT_ADDRESS,
        MARKET_CONTRACT_ABI,
        signer
      );
      const monkeyContract = new Contract(
        BLUEMONKEY_ADDRESS,
        BLUEMONKEY_ABI,
        signer
      );

      let tokenValue = document.getElementById("inputField").value;
      const tokenValue1 = Math.floor(tokenValue * 0, 99);
      const costs = await marketContract.getTotalPrice(tokenValue);
      const cost = ethers.utils.formatEther(costs.toString());
      console.log(marketContract.address);
      const tx1 = await monkeyContract.approve(
        marketContract.address,
        tokenValue
      );
      await tx1.wait();
      const tx = await marketContract.sell(tokenValue);
      setLoading(true);
      await tx.wait();
      setLoading(false);
      getTokenBalance();
      getEthBalance();
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    getEthBalance();
    getTokenBalance();
    setWalletConnected(true);
  };

  useEffect(() => {
    if (!walletConnected) {
      connectWallet();
    }
  }, [walletConnected]);

  return (
    <div className={styles.body}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <Heading>MonkeyMarket</Heading>

        <Button color="#505050" onClick={connectWallet}>
          Connect Wallet
        </Button>
      </header>
      <main className={styles.main}>
        <Box
          margin="15%"
          border="1px solid black"
          padding="10%"
          borderRadius="8px"
          textAlign="center"
          background="linear-gradient(172deg, white, transparent)"
        >
          <Flex
            flexDir="column"
            justifyContent="space-between"
            alignItems="center"
          >
            <Heading margin="20px">Trade your BlueMonkeys here</Heading>
            <Box
              border="1px solid #989acd"
              borderRadius="8px"
              maxWidth="50%"
              padding="2% 5%"
              background="linear-gradient(45deg, #545fbe, transparent)"
            >
              <Text>Your Balances</Text>
              <Text>BlueMonkey: {tokenBalance}</Text>
              <Text>ETH: {ethBalance}</Text>
            </Box>
            <Text margin="20px">Enter your amount</Text>
            <Input
              id="inputField"
              onChange={(e) => givePrice(e.target.value)}
            />
            <Text margin="20px">You have to pay {tokenPriceValue} Eth</Text>
            {loading ? (
              <Button>Loading</Button>
            ) : (
              <Flex marginTop="1rem" justifyContent="space-between">
                <Button onClick={buyToken} marginRight="200px">
                  Buy
                </Button>
                <Button onClick={sellToken}>Sell</Button>
              </Flex>
            )}
          </Flex>
        </Box>
      </main>
      <footer className={styles.footer}>
        <Text>A Dapp made by Recrafter Cooperation</Text>
        <ToggleModeBtn />
      </footer>
    </div>
  );
}
