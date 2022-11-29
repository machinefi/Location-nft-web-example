import { ConnectWallet, useContract, useSDK, useAddress, useChainId, Web3Button  } from "@thirdweb-dev/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useStore } from '../store/index';
import { Button, Flex, Text, Box, Spinner } from '@chakra-ui/react'
import { SiweMessage } from 'siwe';
import { useToast } from '@chakra-ui/react'
import getConfig from 'next/config';
import moment from 'moment'
import { observer } from 'mobx-react-lite';
import '../styles/Home.module.css'

const Home = observer(() => {
  const toast = useToast()
  const { mpStore } = useStore()  

  // contract
  const address = useAddress()
  const chainId = useChainId()
  const sdk = useSDK()
  // @ts-ignore
  const contractAddress = mpStore.contract.PebbleMultipleLocationNFT[chainId]
  const contractAbi = mpStore.contract.PebbleMultipleLocationNFTABI
  const { contract } = useContract(contractAddress, contractAbi)


  const loadPublicData = async() => {
    mpStore.setOwnerAddress(address || '')
    const { message, sign } = await mpStore.signInWithMetamask(sdk)
    const places = await mpStore.getAndFormatPlaces.call(contract)
    await mpStore.getClaimOriginList.call(message, sign, places, contract)
    console.log('places===', message, sign, places, mpStore.claimLists)
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
      loadPublicData()
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

        {!mpStore.initLoadinng && address && <Flex mb="2rem" justifyContent="center" textAlign={'center'} fontWeight="500">
          Balance: {mpStore.balance}
        </Flex>}
        {
          !address && <Box w="200px">
            <ConnectWallet accentColor="#805ad5" />
          </Box>
        }
        <Box>
          {
            (mpStore.initLoadinng) ? <Spinner size="xl" color="purple" /> : 
            address && (
              !mpStore.signStatus ? <Button colorScheme="purple" w="200px" disabled size="lg">Sign Failed</Button> :
                mpStore.claimLists.length === 0 ? <Button colorScheme="purple" mx="auto" w="200px" disabled size="lg">Incompatible</Button> :
                <Box flexDirection="column" alignItems={'center'} w="full">
                  {
                    mpStore.claimLists.map((item:any, oindex:number) =>{
                      return  <Flex key={item.devicehash} mb='1rem' w="545px" alignItems={'center'} justifyContent={'space-between'}>
                          <Text>Device Hash{item.claimed}：{`${item.devicehash.slice(0, 5)}...${item.devicehash.slice( item.devicehash.length - 5, item.devicehash.length)}`}</Text>
                          {
                            item.claimed ? <Button colorScheme="purple" disabled size="sm">Claimed</Button> : 
                            <Button isLoading={mpStore.claimNFT.loading.value} colorScheme="purple" ml="1rem"  size="sm" onClick={() => mpStore.claimNFT.function(contract, item)}>Claim</Button>
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
})


export default Home