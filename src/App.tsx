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
import { utils } from 'ethers'


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
  const [places, setPlaces] = useState<any>([])

  // contract
  const address = useAddress()
  const chainId = useChainId()
  const sdk = useSDK()
  // @ts-ignore
  const contractAddress = metapebbleStore.contract.PebbleMultipleLocationNFT[chainId]
  const contractAbi = metapebbleStore.contract.PebbleMultipleLocationNFTABI
  const { contract } = useContract(contractAddress, contractAbi)

  const domain = window.location.host;
  const origin = window.location.origin;

  // create sign
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
    const message = createSiweMessage( address || '', 'Sign in Location Based NFT');
    const sign = await sdk?.wallet.sign(message)
    // @ts-ignore
    setSignature(sign)
    console.log('Sign in Location Based NFT', message, sign);
    if(sign) {
      // initNft(message, sign);
    }
  }

  // formatPlaces
  const formatPlaces = async() => {
    let data = []
    // places count
    const result = await contract?.call("palceCount");
    const count = result.toNumber()
    console.log('palceCount', count);

    for(let i = 0; i < count; i++) {
      // place hash
      const hash = await contract?.call("placesHash", i);
      // place item
      const item = await contract?.call("places", hash);
      console.log('item', i, hash, item, item.maxDistance.toNumber());
      const lat = item.lat.toNumber()
      const long = item.long.toNumber()
      data.push({
        latitude: lat > 0 ? lat / 1000000 : (Number(lat.toString().split('-')[1]) / 1000000) * -1,
        longitude: long > 0 ? long / 1000000 : (Number(long.toString().split('-')[1]) / 1000000) * -1,
        distance: item.maxDistance.toNumber()
      })
    }
    console.log('all places', data)
    setPlaces(data)
    initNft(data)
  }

  // init
  const initNft = async(placedata: any) => {
    const params = {
      owner: address,
      latlong: placedata
    }
    const response = await axios.post(`${publicConfig.APIURL}/api/sign_records`, params)    
    console.log('claim-nft', response)
    const result = response.data.result

    // @ts-ignore
    if(result && result.error) {
      setSignStauts(false)
       // @ts-ignore
      toast({description: result.error,status: 'warning',duration: 9000,isClosable: true})
      return
    } else {
      setSignStauts(true)
      getNftBalance()
    }
    if(result) {
      formatDevice(result.data)
    }
  }

  // formatDevice
  const formatDevice = async (data: any) => {
    if(data && data?.length > 0) {
      data.forEach(async (o: any, oindex: number) => {
        // deviceHash
        data[oindex]['hash'] = utils.keccak256(utils.toUtf8Bytes(o.imei))
        data[oindex]['latitude'] = o.latitude * 1000000
        data[oindex]['longitude'] = o.longitude * 1000000
        const result = await contract?.call('claimed', o.hash)
        data[oindex].claimed = result
      })
      console.log('formatDevice', data)
      
      const waitCliamArr = data.filter(async (o: any) => o.claimed === false)
      setTotal(waitCliamArr.length)
      setWaitCliamArr(waitCliamArr)
      console.log('waitCliamArr[index]', waitCliamArr[0])
      if(waitCliamArr.length > 0) setOptionNft(waitCliamArr[0])
    }
    
  }

  // get nft balance
  const getNftBalance = async () => {
    const balanceResult = await contract?.call("balanceOf", address);
    setBalance(balanceResult.toNumber())
    console.log('nft balance', balanceResult.toNumber(), balance);
  }

  // claim nft
  const claimNFT = async (con: any) => {
   try {
     // @ts-ignore
    const { hash, latitude, longitude, distance, timestamp } = optionNft
    console.log('claimNFT', latitude, longitude, distance);
    const signHash = utils.solidityKeccak256(
      ["address", "int256", "int256", "uint256", "bytes32", "uint256"],
      [address, longitude, latitude, distance, hash, timestamp]
    )
    const messageHashBinary = utils.arrayify(signHash)
    // @ts-ignore
    const signature = await sdk?.wallet.sign(messageHashBinary)
    
    const res = await con?.call("claim", longitude , latitude, distance, hash, timestamp, signature)
    console.log('res', res);

    if(res.receipt) {
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
   }
  }

  
  useEffect(() => {
    if(address && contract) {
      formatPlaces()
      // signInWithMetamask()
    }
  }, [contract, chainId, address])

  return (
    <div className="container">
      <main className="main">
        <h1 className="title">
          Location Based <a href="">NFT</a>
        </h1>

        <Flex w={{base: "100%", md: "545px"}} justifyContent="flex-start" flexDirection={'column'} mt="2rem" mb="3rem">
            <Text lineHeight={'1.65rem'}>
              Step 1: <a href="https://metapebble.app/metapebbleapp" target="_blank">Download Metapebble</a> <br />
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
                            contractAddress={contractAddress}
                            contractAbi={contractAbi}
                            action={(con) => claimNFT(con)}
                          >
                            Claim NFT {total > 0 && `(${total-balance})`}
                          </Web3Button>
                  )) :  <Button colorScheme="purple" w="100%" disabled size="lg">Sign Failed</Button>) : 
              <ConnectWallet accentColor="#805ad5" />
            }      
          </Box>
      </main>
    </div>
  );
}
