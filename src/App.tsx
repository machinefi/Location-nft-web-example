import { ConnectWallet, useContract, useSDK, useAddress, useChainId, Web3Button  } from "@thirdweb-dev/react";
import "./styles/Home.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from './store/index';
import {  useLocalObservable } from 'mobx-react-lite';
import { Button, Flex, Text, Box } from '@chakra-ui/react'
import superjson from 'superjson'
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
  const [signStauts, setSignStauts] = useState(true)
  const [index, setIndex] = useState(0)
  const [total, setTotal] = useState(0)
  const [cliamArr, setWaitCliamArr] = useState([])

  const { contract } = useContract(metapebbleStore.contract.PebbleNFT[4690], metapebbleStore.contract.PebbleNFTABI)
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
    const message = createSiweMessage( address || '', 'Sign in Location Based NFT');
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
    const params = `${encodeURIComponent(superjson.stringify({address: address,  contract_address: metapebbleStore.contract.PebbleNFT[chainId], 
      contractName: "PebbleNFT",
      chain_id: chainId?.toString(),
      message: message,
      signature: signature
    }))}`
    const response = await axios.get(`${publicConfig.APIURL}/api/claim-nft?input=${params}`)    
    const result = response.data.result.data.json
    console.log('claim-nft', response)

    if(result && result.error) {
      setSignStauts(false)
      toast({description: result.error,status: 'warning',duration: 9000,isClosable: true})
      return
    } else {
      setSignStauts(true)
      getNftBalance()
    }
    if(result) {
      formatDevice(result)
    }
  }

  const formatDevice = async (data: any) => {
    if(data.list && data.list?.length > 0) {
      data.list.forEach(async (o: any, oindex: number) => {
        const result = await contract?.call('claimed', o.hash)
        data.list[oindex].claimed = result
      })
      console.log('formatDevice', data)
      const waitCliamArr = data.list.filter(async (o: any) => o.claimed == false)
      setTotal(waitCliamArr.length)
      setWaitCliamArr(waitCliamArr)
      if(waitCliamArr.length > 0) setOptionNft(waitCliamArr[index])
    }
    
  }

  const getNftBalance = async () => {
    const balanceResult = await contract?.call("balanceOf", address);
    setBalance(balanceResult.toNumber())
    console.log('nft balance', balanceResult.toNumber(), balance);
  }

  const claimNFT = async (con: any) => {
   try {
    store.loading = true
    // @ts-ignore
    const { hash, r_, s_, v_ } = optionNft
    const res = await con?.call("claim", address?.toLowerCase(), hash, v_, r_, s_)
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
      if(balance < total) {
        setIndex(index + 1)
        setOptionNft(cliamArr[index + 1])
      }
    }
   } catch (err) {
    console.log('claimNFT', err)
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
    if(address) {
      signInWithEthereum()
    }
  }, [chainId, address])

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          Location Based <a href="">NFT</a>
        </h1>

        <Flex w={{base: "100%", md: "545px"}} justifyContent="flex-start" flexDirection={'column'} mt="2rem" mb="3rem">
            {/* <Text fontSize={'1.25rem'}>How to play?</Text> */}
            <Text lineHeight={'1.65rem'}>
              Step 1: Download Metapebble <br />
              Step 2: Register Metapebble and submit location<br />
              Step 3: Claim NFT
            </Text>
          </Flex>

          {address && <Flex mb="2rem" justifyContent="center" textAlign={'center'} fontWeight="500">
            Balance: {balance}
          </Flex>}
          <Box w="200px">
            {
              address ? (
                signStauts ? (
                  (balance >= total && total !== 0)  ? <Button colorScheme="purple" w="100%" disabled size="lg">Cliamed</Button>  : 
                      (
                        !optionNft ? <Button colorScheme="purple" w="100%" disabled size="lg">Incompatible</Button> : 
                          <Web3Button
                            accentColor="#805ad5"
                            contractAddress={metapebbleStore.contract.PebbleNFT[4690]}
                            contractAbi={metapebbleStore.contract.PebbleNFTABI}
                            action={(con) => claimNFT(con)}
                          >
                            Claim NFT {total > 0 && `(${total})`}
                          </Web3Button>
                  )) :  <Button colorScheme="purple" w="100%" disabled size="lg">Sign Failed</Button>) : 
              <ConnectWallet accentColor="#805ad5" />
            }      
          </Box>
      </main>
    </div>
  );
}
