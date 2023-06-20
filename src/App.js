import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import logo from './logo.svg';
import './App.css';
import Web3Modal from "web3modal";
import { useState, useEffect, useRef } from "react";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { abi } from './abi';
//const ethers = require("ethers")
import {ethers} from "ethers"

function App() {
const [isConnected, setIsConnected] = useState(false);
const [hasMetamask, setHasMetamask] = useState(false);
const [signer, setSigner] = useState(undefined);
const [amount, setAmount] = useState(0)

  let web3Modal  = useRef(null);;

  const providerOptions = {
    binancechainwallet: {
      package: true
  },
  /*walletconnect: {
    package: WalletConnectProvider, // required
    options: {
      rpc: { 56: "https://burned-morning-daylight.bsc.discover.quiknode.pro/3560832b130e449f1192fcdffbbe51102c73ec0c/"} // required
    }
    //56: "https://burned-morning-daylight.bsc.discover.quiknode.pro/3560832b130e449f1192fcdffbbe51102c73ec0c/" 
  }*/

};

  useEffect(() => {
    if (typeof window !== "undefined") {
      web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions, // required
      });
    }
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
       const web3ModalProvider = await web3Modal.connect();
      //  setIsConnected(true);
        const provider = new ethers.providers.Web3Provider(web3ModalProvider);
       // setSigner(provider.getSigner());
        const network = await provider.getNetwork();
        const chainId = network.chainId;
        console.log(chainId)
       if(chainId !== 56) {
         alert('Connect to BSC mainnet')
         return
       }
       const accounts = await provider.listAccounts();
       const walletAddress = accounts[0];
       console.log(walletAddress)
       setSigner(provider.getSigner());
        setIsConnected(true);
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsConnected(false);
    }
  }

  async function execute() {
    if (typeof window.ethereum !== "undefined") {
      const contractAddress = "0x914665f724be2257ff00139a4E7a5c519E8Fb6F1";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      if(amount >= 0.001 && amount <= 2) {
      try {
       const balance = await contract.checkbalance()
       const formatBalance = ethers.utils.formatUnits(balance)
       if(formatBalance == 0) {
        alert('Presale has not started')
        return
       }
        const purchaseTokens = await contract.buyTokens({
          value: ethers.utils.parseEther(amount),
          gasLimit: 500000,
        });
        await purchaseTokens.wait()
        console.log("Done")
        alert("Tokens Bought! import into wallet using address 0x115cb5a223C417AA1f5afFDAaeF149d83dF3d794")
      
      } catch (error) {
        console.log(error);
      }
    } else{
      alert("enter amount more than 0.001 and less than 2 BNB")
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  async function info() {
    if (typeof window.ethereum !== "undefined") {
      const contractAddress = "0x914665f724be2257ff00139a4E7a5c519E8Fb6F1";
      const contract = new ethers.Contract(contractAddress, abi, signer);
      try{
        const bnbBalance = await contract.progress()
        const realBnb = ethers.utils.formatEther(bnbBalance)
        console.log(realBnb)
        const boughtTokens = await contract.soldTokens()
        const realTokens = ethers.utils.formatUnits(boughtTokens)
        console.log(realTokens)
        const rate = await contract.getRate()
        const formatRate = rate.toString()
        console.log(formatRate)
      }
      catch(error){
        console.log(error)
      }
    }
  }

  return (

    <div>
    {hasMetamask ? (
      isConnected ? (
        "Connected! "
      ) : (
        <button onClick={() => connect()}>Connect</button>
      )
    ) : (
      "Please install metamask"
    )}
   <input 
   width="100px"
   height="40px"
   type='number'
   value={amount}
   onChange={(event) => setAmount(event.target.value)}
   ></input>
    {isConnected ?<button onClick={() => execute()}>Buy Tokens</button> : ""}
    {isConnected ?<button onClick={() => info()}>info</button> : ""}
  </div>

);
}

export default App;