import { ConnectWallet, useContract, useSDK, useAddress, useChainId, useMetamask, useWalletConnect } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { useStore } from "../store/index";
import { Button, Flex, Text, Menu, MenuButton, MenuList, MenuItem, Box, Spinner, Image } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {metamaskUtils} from '../store/metaskUtils'
import Head from 'next/head'


const Home = observer(() => {
  const toast = useToast();
  const { mpStore } = useStore();

  const [address, chainId, sdk, connectWithMetamask, connectWithWalletConnect] = [useAddress(), useChainId(), useSDK(), useMetamask(), useWalletConnect()];
  const { address: contractAddress, abi: contractAbi } = mpStore.contract.LocationNFT[chainId as number] || {};
  const { contract } = useContract(contractAddress, contractAbi);

  useEffect(() => {
    if (address && contract && chainId) {
      mpStore.init({ contract, address, chainId, sdk });
    }
  }, [contract, chainId, address]);

  useEffect(() => {
    // TODO: request metamask switch network
    if (chainId && chainId !== 4690 && chainId !== 4689 ) {
       metamaskUtils.setupNetwork({
        chainId: 4689,
        blockExplorerUrls: ['https://iotexscan.io'],
        chainName: 'IoTeX',
        nativeCurrency: {
          decimals:  18,
          name: 'IOTX Mainnet',
          symbol: 'IOTX'
        },
        rpcUrls: ['https://babel-api.mainnet.iotex.io/']
      });
    }
  }, [chainId, sdk]);

  return (
    <Box w="100vw" h="100vh" overflow={'hidden'} bg="linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%);">
      <Head>
        <title>Claim Your CES-W3bstream NFT</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="https://fonts.googlefonts.cn/css?family=Prompt" rel="stylesheet" />
      </Head>
      <Flex flexDirection={'column'} w="100vw" h="100vh" overflow={{base: "auto", lg: 'hidden'}} bgImage={{base: "url(images/bg_mobile.png)", lg: "url(images/bg.png)"}} bgSize={{base: "100%", lg: "100% 100%"}} bgPosition={{base: "0 210px", lg: "0 0"}} bgRepeat="no-repeat">
        {/* logos */}
        <Flex justifyContent={{base: "center", lg: "flex-start"}} ml={{base: "0", md: "5%", xl: "15%"}} mt={{base: "4rem", lg: "3rem", xl: "4rem", "2xl": "6rem"}} mb={{base: "2rem", md: "2rem", lg: "3rem", "2xl": "4rem"}} alignItems={'center'}>
          <Image flex="none" src="images/logo.png" mr="4.375rem" alt="" h="2.5rem"></Image>
          <Image flex="none" src="images/logo_CES.png" alt="" h="3.5rem"></Image>
        </Flex>
        {/* mobile title */}
        <Box display={{base:"block", lg:"none"}} textAlign='center'>
          <Text whiteSpace={'pre-line'} fontSize={{base: "28px", lg: "3rem", xl: "3.75rem"}} fontWeight={700} lineHeight={{base: "34px", lg: "4.5rem"}} fontFamily={'Prompt'}>{`Claim Your CES-\nW3bstream NFT`}</Text>
          <Text whiteSpace={'pre-line'} fontSize={{base: "11px", lg: "1.25rem"}} fontWeight={300} mt={{base: "11px", lg: "1.2rem", xl: "1.5625rem"}} mb={{base: "35px", lg: "1.5rem", xl: "2.5rem"}} fontFamily={'Helvetica'}>
            {`Simply download and register Meta-Pebble.\nSubmit your location to claim the NFT reward!`}
          </Text>
        </Box>

        {/* center */}
        <Flex flex={{base: "none", lg: "1"}} ml={{base: "0", md: "5%", xl: "15%"}} flexDirection={{base: "column", lg: "row"}} justifyContent={{base: "center", lg: "flex-start"}} alignItems={{base: "center", lg: "flex-start"}}>
         {/* badge */}
         <Box bgImage={"url(images/bg_nft.png)"} bgSize="100% 100%" flex="none" w={{base: "300px", lg: "22.5rem"}} h={{base: "330px", lg: "24.75rem"}} maxWidth={'22.5rem'} mr={{base: "0", lg: "4rem"}}>
          <Image className="badgeAnimate" src="images/badge.png" alt="" w={{base: "221px", lg: "16.6rem"}} mx="auto" mt="3.4181rem"></Image>
         </Box>
         {/* title */}
         <Box textAlign={{base: "center", lg: 'left'}} py={{base: "80px", lg: 0}} w={{base: "90%", lg: "auto"}}>
          <Text display={{base:"none", lg:"block"}} whiteSpace={'pre-line'} fontSize={{base: "3.5rem", lg: "3rem", xl: "3.75rem"}} fontWeight={700} lineHeight="4.5rem" fontFamily={'Prompt'}>{`Claim Your CES-\nW3bstream NFT`}</Text>
          <Text display={{base:"none", lg:"block"}} whiteSpace={'pre-line'} fontSize="1.25rem" fontWeight={300} mt={{base: "1rem", lg: "1.2rem", xl: "1.5625rem"}} mb={{base: "1.5rem", lg: "1.5rem", xl: "2.5rem"}} fontFamily={'Helvetica'}>
            {`Simply download and register Meta-Pebble.\nSubmit your location to claim the NFT reward!`}
          </Text>
            {!address && (
              <Menu>
                <MenuButton as={Button}  w={{base: "14.275rem", lg: "20rem"}} h={{base: "50px", lg: "4rem"}} borderRadius={0}  bg="white" _hover={{opacity: 1}} _focus={{opacity: 1}}>
                  <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize={{base: "1rem", lg:"1.5rem"}} fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
                    textFillColor: "transparent"
                  }}>Connect Wallet</Text>
                </MenuButton>
                <MenuList w={{base: "14.275rem", lg: "20rem"}} bg="rgb(0, 0, 0)" py="0" borderRadius={0}>
                  <MenuItem onClick={connectWithMetamask} h="4rem" bg="rgb(0, 0, 0)" _hover={{bg: "rgba(255, 255, 255, 0.15)"}} pl="1rem">
                    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="28" fill="white"></rect><path d="M24.0891 3.1199L15.3446 9.61456L16.9617 5.7828L24.0891 3.1199Z" fill="#E2761B" stroke="#E2761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M3.90207 3.1199L12.5763 9.67608L11.0383 5.7828L3.90207 3.1199Z" fill="#E4761B" stroke="#E4761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20.9429 18.1745L18.6139 21.7426L23.597 23.1136L25.0295 18.2536L20.9429 18.1745Z" fill="#E4761B" stroke="#E4761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.97929 18.2536L4.40301 23.1136L9.38607 21.7426L7.05713 18.1745L2.97929 18.2536Z" fill="#E4761B" stroke="#E4761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.10483 12.1456L7.71626 14.2461L12.6642 14.4658L12.4884 9.14877L9.10483 12.1456Z" fill="#E4761B" stroke="#E4761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.8864 12.1456L15.4589 9.08725L15.3446 14.4658L20.2837 14.2461L18.8864 12.1456Z" fill="#E4761B" stroke="#E4761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.38606 21.7426L12.3566 20.2925L9.79033 18.2888L9.38606 21.7426Z" fill="#E4761B" stroke="#E4761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.6347 20.2925L18.6139 21.7426L18.2009 18.2888L15.6347 20.2925Z" fill="#E4761B" stroke="#E4761B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.6139 21.7426L15.6347 20.2925L15.8719 22.2348L15.8456 23.0521L18.6139 21.7426Z" fill="#D7C1B3" stroke="#D7C1B3" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.38606 21.7426L12.1544 23.0521L12.1368 22.2348L12.3566 20.2925L9.38606 21.7426Z" fill="#D7C1B3" stroke="#D7C1B3" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.1984 17.0056L9.72002 16.2762L11.4689 15.4765L12.1984 17.0056Z" fill="#233447" stroke="#233447" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.7928 17.0056L16.5223 15.4765L18.28 16.2762L15.7928 17.0056Z" fill="#233447" stroke="#233447" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.38606 21.7426L9.80791 18.1745L7.05712 18.2536L9.38606 21.7426Z" fill="#CD6116" stroke="#CD6116" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.1921 18.1745L18.6139 21.7426L20.9429 18.2536L18.1921 18.1745Z" fill="#CD6116" stroke="#CD6116" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20.2837 14.2461L15.3446 14.4658L15.8016 17.0057L16.5311 15.4765L18.2888 16.2762L20.2837 14.2461Z" fill="#CD6116" stroke="#CD6116" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.72002 16.2762L11.4777 15.4765L12.1984 17.0057L12.6642 14.4658L7.71626 14.2461L9.72002 16.2762Z" fill="#CD6116" stroke="#CD6116" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7.71626 14.2461L9.79033 18.2888L9.72002 16.2762L7.71626 14.2461Z" fill="#E4751F" stroke="#E4751F" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18.2888 16.2762L18.2009 18.2888L20.2837 14.2461L18.2888 16.2762Z" fill="#E4751F" stroke="#E4751F" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12.6642 14.4658L12.1984 17.0057L12.7784 20.0025L12.9102 16.0565L12.6642 14.4658Z" fill="#E4751F" stroke="#E4751F" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.3446 14.4658L15.1073 16.0477L15.2128 20.0025L15.8016 17.0057L15.3446 14.4658Z" fill="#E4751F" stroke="#E4751F" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.8016 17.0056L15.2128 20.0025L15.6347 20.2925L18.2009 18.2888L18.2888 16.2762L15.8016 17.0056Z" fill="#F6851B" stroke="#F6851B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.72002 16.2762L9.79033 18.2888L12.3566 20.2925L12.7784 20.0025L12.1984 17.0056L9.72002 16.2762Z" fill="#F6851B" stroke="#F6851B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.8456 23.0521L15.8719 22.2348L15.6522 22.0414H12.339L12.1368 22.2348L12.1544 23.0521L9.38606 21.7426L10.3528 22.5336L12.3126 23.8958H15.6786L17.6472 22.5336L18.6139 21.7426L15.8456 23.0521Z" fill="#C0AD9E" stroke="#C0AD9E" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.6347 20.2925L15.2128 20.0025H12.7784L12.3566 20.2925L12.1368 22.2348L12.339 22.0414H15.6522L15.8719 22.2348L15.6347 20.2925Z" fill="#161616" stroke="#161616" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M24.4583 10.0364L25.2053 6.45072L24.0891 3.1199L15.6347 9.39485L18.8864 12.1456L23.4827 13.4903L24.5022 12.3038L24.0628 11.9874L24.7658 11.3459L24.221 10.924L24.924 10.3879L24.4583 10.0364Z" fill="#763D16" stroke="#763D16" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.79472 6.45072L3.54174 10.0364L3.06717 10.3879L3.77024 10.924L3.23415 11.3459L3.93722 11.9874L3.4978 12.3038L4.50847 13.4903L9.10483 12.1456L12.3566 9.39485L3.90207 3.1199L2.79472 6.45072Z" fill="#763D16" stroke="#763D16" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M23.4827 13.4903L18.8864 12.1456L20.2837 14.2461L18.2009 18.2888L20.9429 18.2536H25.0295L23.4827 13.4903Z" fill="#F6851B" stroke="#F6851B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9.10484 12.1456L4.50848 13.4903L2.97929 18.2536H7.05713L9.79033 18.2888L7.71626 14.2461L9.10484 12.1456Z" fill="#F6851B" stroke="#F6851B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path><path d="M15.3446 14.4658L15.6347 9.39485L16.9705 5.7828H11.0383L12.3566 9.39485L12.6642 14.4658L12.7696 16.0653L12.7784 20.0025H15.2128L15.2304 16.0653L15.3446 14.4658Z" fill="#F6851B" stroke="#F6851B" stroke-width="0.0878845" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    <Text ml='12px' fontSize={'1rem'}>MetaMask</Text>
                  </MenuItem>
                  <MenuItem onClick={connectWithWalletConnect} h="4rem" bg="rgb(0, 0, 0)" _hover={{bg: "rgba(255, 255, 255, 0.15)"}} pl="1rem">
                    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="28" height="28" fill="#3B99FC"></rect><path d="M8.38969 10.3739C11.4882 7.27538 16.5118 7.27538 19.6103 10.3739L19.9832 10.7468C20.1382 10.9017 20.1382 11.1529 19.9832 11.3078L18.7076 12.5835C18.6301 12.6609 18.5045 12.6609 18.4271 12.5835L17.9139 12.0703C15.7523 9.9087 12.2477 9.9087 10.0861 12.0703L9.53655 12.6198C9.45909 12.6973 9.3335 12.6973 9.25604 12.6198L7.98039 11.3442C7.82547 11.1893 7.82547 10.9381 7.98039 10.7832L8.38969 10.3739ZM22.2485 13.012L23.3838 14.1474C23.5387 14.3023 23.5387 14.5535 23.3838 14.7084L18.2645 19.8277C18.1096 19.9827 17.8584 19.9827 17.7035 19.8277C17.7035 19.8277 17.7035 19.8277 17.7035 19.8277L14.0702 16.1944C14.0314 16.1557 13.9686 16.1557 13.9299 16.1944C13.9299 16.1944 13.9299 16.1944 13.9299 16.1944L10.2966 19.8277C10.1417 19.9827 9.89053 19.9827 9.73561 19.8278C9.7356 19.8278 9.7356 19.8277 9.7356 19.8277L4.61619 14.7083C4.46127 14.5534 4.46127 14.3022 4.61619 14.1473L5.75152 13.012C5.90645 12.857 6.15763 12.857 6.31255 13.012L9.94595 16.6454C9.98468 16.6841 10.0475 16.6841 10.0862 16.6454C10.0862 16.6454 10.0862 16.6454 10.0862 16.6454L13.7194 13.012C13.8743 12.857 14.1255 12.857 14.2805 13.012C14.2805 13.012 14.2805 13.012 14.2805 13.012L17.9139 16.6454C17.9526 16.6841 18.0154 16.6841 18.0541 16.6454L21.6874 13.012C21.8424 12.8571 22.0936 12.8571 22.2485 13.012Z" fill="white"></path></svg>
                    <Text ml='12px' fontSize={'1rem'}>WalletConnect</Text>
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
            
            <Box>
              {mpStore.initLoadinng ? (
                <Spinner size="xl" color="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" />
              ) : (
                address &&
                (!mpStore.signStatus ? (
                  <Button w={{base: "14.275rem", lg: "20rem"}} h={{base: "50px", lg: "4rem"}} borderRadius={0} disabled bg="white">
                    <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize={{base: "1rem", lg:"1.5rem"}} fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
                      textFillColor: "transparent"
                    }}>Sign Failed</Text>
                  </Button>
                ) : mpStore.claimLists.value?.length === 0 ? (
                  <Button w={{base: "14.275rem", lg: "20rem"}} h={{base: "50px", lg: "4rem"}} borderRadius={0} disabled bg="white">
                    <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize={{base: "1rem", lg:"1.5rem"}} fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
                      textFillColor: "transparent"
                    }}>Not Eligible</Text>
                  </Button>
                ) : (
                  <Box flexDirection="column" alignItems={"center"} w="full">
                    {mpStore.claimLists.value?.map((item: any, oindex: number) => {
                      return (
                        <Flex key={item.devicehash} mb="1rem" w="100%" alignItems={"center"} justifyContent={"space-between"}>
                          <Text>
                            Device Hash{item.claimed}：{`${item.devicehash.slice(0, 5)}...${item.devicehash.slice(item.devicehash.length - 5, item.devicehash.length)}`}
                          </Text>
                          {item.claimed ? (
                            <Button bg="white" disabled size="sm">
                              <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize="0.875rem" fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
                                textFillColor: "transparent"
                              }}>Claimed</Text>
                            </Button>
                          ) : (
                            <Button isLoading={mpStore.claimNFT.loading.value} onClick={() => mpStore.claimNFT.call(item)} bg="white" size="sm">
                              <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize="0.875rem" fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
                                textFillColor: "transparent"
                              }}>Claim</Text>
                            </Button>
                          )}
                        </Flex>
                      );
                    })}
                  </Box>
                ))
              )}
            </Box>
         </Box>
        </Flex>
        {/* steps */}
        <Flex w="100%" flexDirection={{base: "column", lg: "row"}} py={{base: "40px", lg: "2rem"}} bg="rgba(255, 255, 255, 0.1);" justifyContent={"center"} alignItems="center" fontFamily={'Helvetica'} fontSize={'1.25rem'} fontWeight={400}>
          <Box w={{base: "90%", lg: "21.875rem"}} textAlign={'center'} pb="24px">
            <Image src="images/step1.png" alt="" width="4rem" mb="1rem" mx="auto"></Image>
            <a href="https://iopay.me" rel="noreferrer" target="_blank">
              <Text whiteSpace={{base: "normal", lg: "pre-line"}}>{`Download ioPay Wallet`}</Text>
            </a>
          </Box>
          <Image display={{base: "none", lg: "block"}} src="images/right.png" alt="" width="2rem" h="2rem" flex="none" mx="1rem"></Image>
          <Image display={{base: "block", lg: "none"}} src="images/down.png" alt="" width="2rem" h="2rem" flex="none" my="1rem"></Image>
          <Box w={{base: "90%", lg: "21.875rem"}} textAlign={'center'}>
            <Image src="images/step2.png" alt="" width="4rem" mb="1rem" mx="auto"></Image>
            <Text whiteSpace={{base: "normal", lg: "pre-line"}}>{`Enbale W3bstream in ioPay \n Bind Geo Location to Wallet`}</Text>
          </Box>
          <Image display={{base: "none", lg: "block"}} src="images/right.png" alt="" width="2rem" h="2rem" flex="none" mx="1rem"></Image>
          <Image display={{base: "block", lg: "none"}} src="images/down.png" alt="" width="2rem" h="2rem" flex="none" my="1rem"></Image>
          <Box w={{base: "90%", lg: "21.875rem"}} textAlign={'center'} pb="24px">
            <Image src="images/step3.png" alt="" width="4rem" mb="1rem" mx="auto"></Image>
            Claim NFT
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

export default Home;
