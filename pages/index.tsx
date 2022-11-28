import { ConnectWallet, useContract, useSDK, useAddress, useChainId, Web3Button  } from "@thirdweb-dev/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from '../store/index';
import { Button, Flex, Text, Box, Spinner } from '@chakra-ui/react'
import { SiweMessage } from 'siwe';
import { useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import moment from 'moment'
import { BigNumber } from 'bignumber.js';
import '../styles/Home.module.css'

type DEVICE_ITEM = {
  latitude: number
  longitude: number
  timestamp: number
  distance: number
  signature: string
  devicehash: string
}

type PLACE_ITEM = {
  latitude: number
  longitude: number
  distance: number
}

const { publicRuntimeConfig } = getConfig();

const { NEXT_PUBLIC_APIURL } = publicRuntimeConfig;

export default function Home() {
  const toast = useToast()
  const {metapebbleStore} = useStore()  
  const [balance, setBalance] = useState(0)
  const [index, setIndex] = useState(0)
  const [signStauts, setSignStauts] = useState(true)
  const [cliamArr, setWaitCliamArr] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [claimLoading, setClaimLoading] = useState(false)

  // contract
  const address = useAddress()
  const chainId = useChainId()
  const sdk = useSDK()
  // @ts-ignore
  const contractAddress = metapebbleStore.contract.PebbleMultipleLocationNFT[chainId]
  const contractAbi = metapebbleStore.contract.PebbleMultipleLocationNFTABI
  const { contract } = useContract(contractAddress, contractAbi)

  // create sign
  const domain =
  typeof window !== 'undefined' && window.location.host
      ? window.location.host
      : '';
  const origin =
        typeof window !== 'undefined' && window.location.origin
            ? window.location.origin
            : '';

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

  // sign metamask
  const signInWithMetamask = async() => {
    setLoading(true)
    const message = createSiweMessage( address || '', 'Sign in Location Based NFT');
    const sign = await sdk?.wallet.sign(message)
    if(sign) formatPlaces(message, sign)
  }


  // format Places
  const formatPlaces = async(message: string, signature: string) => {
    let data = []
    // places count
    const result = await contract?.call("palceCount");
    const count = result.toNumber()

    for(let i = 0; i < count; i++) {
      // place hash
      const hash = await contract?.call("placesHash", i);
      // place item
      const item = await contract?.call("places", hash);
      const lat = item.lat.toNumber()
      const long = item.long.toNumber()
      data.push({
        latitude: new BigNumber(item.lat.toString()).div(1e6).toNumber(),
        longitude: new BigNumber(item.long.toString()).div(1e6).toNumber(),
        distance: item.maxDistance.toNumber()
      })
    }
    console.log('palces', data);
    if(data.length !== 0) initNft(message, signature, data)
  }

  // init
  const initNft = async(message: string, signature: string, places: any) => {
    try {
      const response = await axios.post(`${NEXT_PUBLIC_APIURL}/api/get_sign_data_for_location`, {
        signature,
        message, 
        owner: address,
        from: `${moment().startOf('day').unix()}`,
        to: `${moment().endOf('day').unix()}`,
        locations: places
      })    
      console.log('initNft', response)
      const result = response.data.result
      
      if(result) {
        setSignStauts(true)
        getNftBalance()
        formatDevice(result.data)
        setLoading(false)
      }
    } catch (error) {
      console.log('initNft error', error)
      setSignStauts(false)
      setLoading(false)
      toast({
        description: 'Signature is not valid',
        status: 'warning',
        duration: 9000,
        isClosable: true
      })
    }
  }

  // format Device
  const formatDevice = async (data: any) => {
    const list = [...data]
    if(list.length > 0) {
      list.forEach(async (item: DEVICE_ITEM, index) => {
        const status = await contract?.call("claimed", item.devicehash)
        list[index] = {...item, claimed: status, loading: false}
      })
      setWaitCliamArr(list)
      console.log('formatDevice', list)
    }
  }

  // get nft balance
  const getNftBalance = async () => {
    const balanceResult = await contract?.call("balanceOf", address);
    setBalance(balanceResult.toNumber())
  }

  // claim nft
  const claimNFT = async (con: any, item: any, index: number) => {
   try {
    setIndex(index)
    setClaimLoading(true)
    const { latitude , longitude, distance, devicehash, timestamp, signature } = item
    console.log('item', item)
    const res = await con?.call("claim", latitude , longitude, distance, devicehash, timestamp, signature)
    console.log('claimNFT res', res);

    if(res.receipt) {
      toast({
        description: res.receipt.blockHash,
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      getNftBalance()
      setClaimLoading(false)
      formatDevice(cliamArr)
    }
   } catch (err) {
    console.log('claimNFT err', err)
    setClaimLoading(false)
    toast({
      description: 'Claim failed',
      status: 'error',
      duration: 9000,
      isClosable: true,
    })
   }
  }


  useEffect(() => {
    if(chainId && chainId !== 4690) {
      toast({
        description: 'Please switch to the IoTeX Testnet network',
        status: 'warning',
        duration: 9000,
        isClosable: true,
      })
    }
  }, [chainId])

  
  useEffect(() => {
    if(address && contract && chainId) {
      signInWithMetamask()
    }
  }, [contract, chainId, address])

  return (
    <Flex h="100vh" flexDirection="column" justifyContent="center" alignItems="center">
        <Text className="title" fontSize={50}>
          Location Based <a href="">NFT</a>
        </Text>
        <Flex w={{base: "100%", md: "545px"}} justifyContent="flex-start" flexDirection={'column'} mt="2rem" mb="3rem">
          <Text lineHeight={'1.65rem'}>
            Step 1: <a href="https://metapebble.app/metapebbleapp" rel="noreferrer" target="_blank">Download Metapebble</a> <br />
            Step 2: Register Metapebble and submit location<br />
            Step 3: Claim NFT
          </Text>
        </Flex>

        {!loading && address && <Flex mb="2rem" justifyContent="center" textAlign={'center'} fontWeight="500">
          Balance: {balance}
        </Flex>}

        
        {
          !address && <Box w="200px">
            <ConnectWallet accentColor="#805ad5" />
          </Box>
        }
        <Box>
          {
            (loading && address) ? <Spinner size="xl" color="purple" /> : 
            address && (
              !signStauts ? <Button colorScheme="purple" w="200px" disabled size="lg">Sign Failed</Button> :
                cliamArr.length === 0 ? <Button colorScheme="purple" mx="auto" w="200px" disabled size="lg">Incompatible</Button> :
                <Box flexDirection="column" alignItems={'center'} w="full">
                  {
                    cliamArr.map((item:any, oindex:number) =>{
                      return  <Flex key={item.devicehash} mb='1rem' w="545px" alignItems={'center'} justifyContent={'space-between'}>
                          <Text>Device Hash{item.claimed}：{`${item.devicehash.slice(0, 5)}...${item.devicehash.slice( item.devicehash.length - 5, item.devicehash.length)}`}</Text>
                          {
                            item.claimed ? <Button colorScheme="purple" disabled size="sm">Claimed</Button> : 
                            <Button isLoading={claimLoading && index === oindex} colorScheme="purple" ml="1rem"  size="sm" onClick={() => claimNFT(contract, item, oindex)}>Claim</Button>
                          }
                        </Flex>
                    })
                  }
                </Box>
            ) 
          }      
        </Box>
    </Flex>
  );
}
