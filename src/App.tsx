import { ConnectWallet, useContract, useAddress, useChainId, Web3Button  } from "@thirdweb-dev/react";
import "./styles/Home.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from './store/index';
import {  useLocalObservable } from 'mobx-react-lite';
import toast from 'react-hot-toast';
import { Button, Flex } from '@chakra-ui/react'
import superjson from 'superjson'
import BigNumber from 'bignumber.js';

export default function Home() {
  const {metapebbleStore} = useStore()  

  const [balance, setBalance] = useState(0)
  const [optionNft, setOptionNft] = useState({
    user_: '',
    value_: 0,
    v_: 0,
    s_: '',
    r_: '',
  })

  const { contract } = useContract(metapebbleStore.contract.PresentSBT[4690], metapebbleStore.contract.PresentSBTABI)
  const address = useAddress()
  const chainId = useChainId()

  const store = useLocalObservable(() => ({
    loading: false,
  }));

  const initNft = async() => {
    // @ts-ignore
    const params = `${encodeURIComponent(superjson.stringify({address: address,  contract_address: metapebbleStore.contract.PresentSBT[chainId], chain_id: chainId?.toString(),}))}`
    const res = await axios.get(`https://metapebble-oauth-demo-pr-4.onrender.com/api/claim-nft?input=${params}`)
    console.log('claim-nft', res)
    if(res) {
      // @ts-ignore
      setOptionNft(res.data.result.data.json)
      getNftBalance()
    }
  }

  const getNftBalance = async () => {
    const balanceResult = await contract?.call("balanceOf", address);
    setBalance(balanceResult.toNumber())
    console.log('nft balance', balanceResult.toNumber(), balance);
  }

  const claimNFT = async (con: any) => {
    store.loading = true
    const { user_, r_, s_, v_ } = optionNft
    const res = await con?.call("claim", user_, v_, r_, s_)
    console.log('res', res);
    if(res.receipt) {
      store.loading = false
      toast.success(res.receipt.blockHash)
      getNftBalance()
    } else {
      toast.error('Claim failed')
      store.loading = false
    }
  }

  
  useEffect(() => {
    if(chainId && address) {
      console.log(chainId, address)
      initNft()
    }
  }, [chainId, address])

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          Welcome to <a href="">MetaPebble</a>!
        </h1>

        <div className="connect">
          {address && <Flex mb="2rem" justifyContent="center" textAlign={'center'} fontWeight="500">
            Balance: {balance}
          </Flex>}
          {
            balance > 0  ? <Button colorScheme="purple" w="100%" disabled size="lg">Cliamed</Button> : (
              !optionNft ? <Button colorScheme="purple" w="100%" disabled size="lg">Incompatible</Button> : <Web3Button
                accentColor="#805ad5"
                contractAddress={metapebbleStore.contract.PresentSBT[4690]}
                contractAbi={metapebbleStore.contract.PresentSBTABI}
                action={(con) => claimNFT(con)}
              >
                Cliam NFT
              </Web3Button>
            ) 
          }
      
        </div>
      </main>
    </div>
  );
}
