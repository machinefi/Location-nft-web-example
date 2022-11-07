import { ConnectWallet, useContract, useSDK, useAddress, useChainId, Web3Button  } from "@thirdweb-dev/react";
import "./styles/Home.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from './store/index';
import {  useLocalObservable } from 'mobx-react-lite';
import { Button, Flex } from '@chakra-ui/react'
import superjson from 'superjson'
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { publicConfig} from './config'
import { useToast } from '@chakra-ui/react'


type optionNft = {
  user_: string
  value_: number
  v_: number
  s_: string
  r_: string
}

export default function Home() {
  const {metapebbleStore} = useStore()  
  const toast = useToast()

  const [balance, setBalance] = useState(0)
  const [signature, setSignature] = useState('')
  const [optionNft, setOptionNft] = useState(null)
  const [signStauts, setSignStauts] = useState(false)

  const { contract } = useContract(metapebbleStore.contract.PresentSBT[4690], metapebbleStore.contract.PresentSBTABI)
  const address = useAddress()
  const chainId = useChainId()
  const sdk = useSDK()

  const domain = window.location.host;
  const origin = window.location.origin;

  const createSiweMessage = (address: string, statement: string) => {
    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: '1',
      chainId
    });
    return message.prepareMessage();
  }

 const signInWithEthereum = async() => {
    const message = createSiweMessage( address || '', 'Sign in with Ethereum to the app.');
    const sign = await sdk?.wallet.sign(message)
    // @ts-ignore
    setSignature(sign)
    console.log('signInWithEthereum', message, sign);
    if(sign) {
      initNft(message, sign);
    }
  }

  const store = useLocalObservable(() => ({
    loading: false,
  }));

  const initNft = async(message:string, signature:string) => {
    // @ts-ignore
    const params = `${encodeURIComponent(superjson.stringify({address: address,  contract_address: metapebbleStore.contract.PresentSBT[chainId], 
      chain_id: chainId?.toString(),
      message: message,
      signature: signature
    }))}`
    const response = await axios.get(`${publicConfig.APIURL}/api/claim-nft?input=${params}`)
    console.log('claim-nft', response)
    const result = response.data.result.data.json
    if(result && result.error) {
      setSignStauts(false)
      toast({
        description: result.error,
        status: 'warning',
        duration: 9000,
        isClosable: true,
      })
      return
    } else {
      setSignStauts(true)
    }

    if(response) {
      getNftBalance()
      setOptionNft(result)
    }
  }

  const getNftBalance = async () => {
    const balanceResult = await contract?.call("balanceOf", address);
    setBalance(balanceResult.toNumber())
    console.log('nft balance', balanceResult.toNumber(), balance);
  }

  const claimNFT = async (con: any) => {
    store.loading = true
    // @ts-ignore
    const { user_, r_, s_, v_ } = optionNft
    const res = await con?.call("claim", user_, v_, r_, s_)
    console.log('res', res);
    if(res.receipt) {
      store.loading = false
      toast({
        description: res.receipt.blockHash,
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      getNftBalance()
    } else {
      toast({
        description: 'Claim failed',
        status: 'error',
        duration: 9000,
        isClosable: true,
      })
      store.loading = false
    }
  }

  
  useEffect(() => {
    if(chainId && address) {
      signInWithEthereum()
    }
  }, [chainId, address])

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          Location Based NFT  
        </h1>

        <div className="connect">
          {address && <Flex mb="2rem" justifyContent="center" textAlign={'center'} fontWeight="500">
            Balance: {balance}
          </Flex>}
          {
            address ? (
              signStauts ? (
                  balance > 0  ? <Button colorScheme="purple" w="100%" disabled size="lg">Cliamed</Button> : 
                    (
                      !optionNft ? <Button colorScheme="purple" w="100%" disabled size="lg">Incompatible</Button> : 
                        <Web3Button
                          accentColor="#805ad5"
                          contractAddress={metapebbleStore.contract.PresentSBT[4690]}
                          contractAbi={metapebbleStore.contract.PresentSBTABI}
                          action={(con) => claimNFT(con)}
                        >
                          Cliam NFT
                        </Web3Button>
                )) :  <Button colorScheme="purple" w="100%" disabled size="lg">Sign Failed</Button>) : 
            <ConnectWallet accentColor="#805ad5" />
          }      
        </div>
      </main>
    </div>
  );
}
