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
  const [cliamArr, setWaitCliamArr] = useState<any>([])
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
    setSignature(sign || '')
    if(sign) formatPlaces()
  }

  // format Places
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
      const lat = item.lat.toNumber()
      const long = item.long.toNumber()
      data.push({
        latitude: lat > 0 ? lat / 1000000 : (Number(lat.toString().split('-')[1]) / 1000000) * -1,
        longitude: long > 0 ? long / 1000000 : (Number(long.toString().split('-')[1]) / 1000000) * -1,
        distance: item.maxDistance.toNumber()
      })
    }
    setPlaces(data)
    initNft(data)
  }

  // init
  const initNft = async(placedata: any) => {
    const response = await axios.post(`${publicConfig.APIURL}/api/sign_records`, {
      owner: address,
      latlong: placedata
    })    
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

  // format Device
  const formatDevice = async (data: any) => {
    if(data && data.length > 0) {
      let waitCliamArr: any = []
      data.forEach(async (o: any, oindex: number) => {
        o.hash = utils.keccak256(utils.toUtf8Bytes(o.imei))
        const result = await contract?.call('claimed', o.hash)
        waitCliamArr.push({
          ...o,
          claimed: result,
          hash: utils.keccak256(utils.toUtf8Bytes(o.imei)),
          latitude: o.latitude * 1000000,
          longitude: o.longitude * 1000000
        })
      })
      setTotal(waitCliamArr.length)
      setWaitCliamArr(waitCliamArr)
      // if(waitCliamArr.length > 0) setOptionNft(waitCliamArr[index])
    }
    
  }

  // get nft balance
  const getNftBalance = async () => {
    const balanceResult = await contract?.call("balanceOf", address);
    setBalance(balanceResult.toNumber())
    console.log('nft balance', balanceResult.toNumber(), balance);
  }

  // claim nft
  const claimNFT = async (con: any, item: any) => {
   try {
     // @ts-ignore
    const { hash, latitude, longitude, distance, timestamp } = item
    const signHash = utils.solidityKeccak256(
      ["address", "int256", "int256", "uint256", "bytes32", "uint256"],
      [address, latitude, longitude, distance, hash, timestamp]
    )
    const messageHashBinary = utils.arrayify(signHash)
    const signature = await sdk?.wallet.sign(`${messageHashBinary}`)
    console.log('signature', signature);

    const res = await con?.call("claim", latitude , longitude, distance, hash, timestamp, signature)
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
          {
            !address && <Box w="200px">
              <ConnectWallet accentColor="#805ad5" />
            </Box>
          }
          <Box>
            {
              address && (
                !signStauts ? <Button colorScheme="purple" w="200px" disabled size="lg">Sign Failed</Button> :
                  cliamArr.length === 0 ? <Button colorScheme="purple" mx="auto" w="200px" disabled size="lg">Incompatible</Button> :
                  <Box flexDirection="column" alignItems={'center'} w="full">
                    {
                      cliamArr.map((item:any) =>{
                        return  <Flex key={item.imei} mb='1rem' w="545px" alignItems={'center'} justifyContent={'space-between'}>
                            <Text>IMEI：{item.imei}</Text>
                            {
                              item.claimed ? <Button colorScheme="purple"  disabled size="lg">Cliamed</Button> : 
                              <Button colorScheme="purple" ml="1rem" onClick={() => claimNFT(contract, item)}>Claim</Button>
                            }
                          </Flex>
                      })
                    }
                  </Box>
              ) 
            }      
          </Box>
      </main>
    </div>
  );
}
