import { ConnectWallet,  useContract, useSDK, useAddress, useChainId, useMetamask, useWalletConnect, useDisconnect } from "@thirdweb-dev/react";
import { useEffect, useMemo } from "react";
import { useStore } from "../../store/index";
import { Button, Flex, Text, Menu, MenuButton, MenuList, MenuItem, Box, Spinner, Image } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import {metamaskUtils} from '../../store/metaskUtils'
import Head from 'next/head'
import Script from 'next/script'
import { useRouter } from 'next/router'



const Template = observer(() => {
  const toast = useToast();
  const { nftStore, erc20Store } = useStore();
  
  const router = useRouter()
  const type = router.query.type as string // type： nft or token
  const name = router.query.name as string // name

  const curStore = type !== 'token' ?  nftStore : erc20Store
  console.log('curStore', curStore, type, name)


  const [address, chainId, sdk, disconnect] = [useAddress(), useChainId(), useSDK(), useDisconnect()];


  useMemo(() => {
    if (typeof window !== 'undefined' && document.getElementById('injected'))  {
      // @ts-ignore
      document.getElementById('injected').innerHTML = `<img src="images/iopay.png" alt="" style="width: 24px; height: 24px;" /> IoPay`;
    }
  }, [])


  useEffect(() => {
    if (type && name && address && chainId) {
      curStore.init({  address, chainId, sdk, disconnect, name });
    }
  }, [type, name, chainId, address]);



  useEffect(() => {
    // TODO: request metamask switch network chainId !== 4690 &&
    if (chainId && chainId !== 4689 ) {
       metamaskUtils.setupNetwork(curStore.config.testnet);
    }
  }, [chainId, sdk]);

  return (
    // @ts-ignore
    <Box w="100vw" h="100vh" overflow={'hidden'} bg={curStore.data?.ui?.bgColor}>
      <Head>
        <title>{curStore.data.ui.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="https://fonts.googlefonts.cn/css?family=Prompt" rel="stylesheet" />
      </Head>
      <Script strategy="afterInteractive">


      </Script>
      <Flex flexDirection={'column'} w="100vw" h="100vh" overflow={{base: "auto", lg: 'hidden'}} bgImage={{base: "url(/images/bg_mobile.png)", lg: "url(/images/bg_pc.png)"}} bgSize={{base: "100%", lg: "100% 100%"}} bgPosition={{base: "0 210px", lg: "0 0"}} bgRepeat="no-repeat">
        {/* logos */}
        <Flex justifyContent={{base: "center", lg: "flex-start"}} ml={{base: "0", md: "5%", xl: "15%"}} mt={{base: "2.5rem", lg: "3rem", xl: "2rem", "2xl": "6rem"}} mb={{base: "2rem", md: "2rem", lg: "2rem", xl: "2rem", "2xl": "4rem"}} alignItems={'center'}>
          {
            curStore.data.ui.logos.map(item => <Image key={item} mr={{base: "1.5rem", lg: "4.375rem"}} flex="none" src={item} alt="" h="2.5rem"></Image>)
          }
        </Flex>
        {/* mobile title */}
        <Box display={{base:"block", lg:"none"}} textAlign='center'>
          <Text whiteSpace={'pre-line'} fontSize={{base: "30px", lg: "3rem", xl: "3.75rem"}} fontWeight={700} lineHeight={{base: "34px", lg: "4.5rem"}} fontFamily={'Prompt'}>{curStore.data.ui.title}</Text>
          <Text whiteSpace={'pre-line'} fontSize={{base: "14px", lg: "1.25rem"}} fontWeight={300} mt={{base: "11px", lg: "1.2rem", xl: "1.5625rem"}} fontFamily={'Helvetica'}>
            {curStore.data.ui.subtitle}
          </Text>
          <a href={curStore.data.ui.tips.url}>
          <Text whiteSpace={'pre-line'} fontSize={{base: "11px", lg: "1.25rem"}} fontWeight={300} mb={{base: "35px", lg: "1.5rem", xl: "2.5rem"}} fontFamily={'Helvetica'}>
              {curStore.data.ui.tips.name}
            </Text>
          </a>
        </Box>

        {/* center */}
        <Flex flex={{base: "none", lg: "1"}} ml={{base: "0", md: "5%", xl: "15%"}} flexDirection={{base: "column", lg: "row"}} justifyContent={{base: "center", lg: "flex-start"}} alignItems={{base: "center", lg: "flex-start"}}>
         {/* badge */}
         {curStore.data.ui.icon && <Box bgImage={`url(${curStore.data.ui.icon.bg})`} bgSize="100% 100%" flex="none" w={{base: "300px", lg: "20rem", "2xl": "22.5rem"}} h={{base: "330px", lg: "22rem", "2xl": "24.75rem"}} maxWidth={'22.5rem'} mr={{base: "0", lg: "4rem"}}>
          <Image className="badgeAnimate" src={`${curStore.data.ui.icon.image}`} alt="" w={{base: "221px", lg: "16.6rem"}} mx="auto" mt="3.4181rem"></Image>
         </Box>}
         {/* title */}
         <Box textAlign={{base: "center", lg: 'left'}} py={{base: "40px", lg: 0}} w={{base: "90%", lg: "auto"}}>
          <Text display={{base:"none", lg:"block"}} whiteSpace={'pre-line'} fontSize={{base: "3.5rem", lg: "3rem", "2xl": "3.75rem"}} fontWeight={700} lineHeight={{md: "4rem", xl: "4rem", "2xl": "4.5rem"}} fontFamily={'Prompt'}>{curStore.data.ui.title}</Text>
          <Text display={{base:"none", lg:"block"}} whiteSpace={'pre-line'} fontSize="1.25rem" fontWeight={300} mt={{base: "1rem", lg: "1rem", "2xl": "1.5625rem"}} fontFamily={'Helvetica'}>
          {curStore.data.ui.subtitle}
          </Text>
          <a href="https://docs.google.com/document/d/1kchVOHNmRUy5JfqLfeprCufgNmxnJlcj8M3_cnFrXyo/edit?usp=sharing">
            <Text mt="0.5rem" display={{base:"none", lg:"block"}} whiteSpace={'pre-line'} fontSize="1.25rem" fontWeight={300} mb={{base: "1.5rem", lg: "1.5rem", "2xl": "2.5rem"}} fontFamily={'Helvetica'}>
            {curStore.data.ui.tips.name}
            </Text>
          </a>
            {!address  ? (
               <ConnectWallet className="walletBtn" />
              ): <Box>
              {curStore.loading  ? (
                <Spinner size="xl" color="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" />
              ) : (
                address &&
                (!curStore.signStatus ? (
                  <Button w={{base: "14.275rem", lg: "20rem"}} h={{base: "50px", lg: "4rem"}} borderRadius={0} disabled bg="white">
                    <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize={{base: "1rem", lg:"1.5rem"}} fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
                      textFillColor: "transparent"
                    }}>Sign Failed</Text>
                  </Button>
                ) : !curStore.claimLists.loading.value && curStore.claimLists.value?.length === 0 ? (
                  <Button w={{base: "14.275rem", lg: "20rem"}} h={{base: "50px", lg: "4rem"}} borderRadius={0} disabled bg="white">
                    <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize={{base: "1rem", lg:"1.5rem"}} fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
                      textFillColor: "transparent"
                    }}>Not Eligible</Text>
                  </Button>
                ) : (
                  <Box flexDirection="column" alignItems={"center"} w="full">
                    {curStore.claimLists.value?.map((item: any, oindex: number) => {
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
                            <Button isLoading={curStore.claimNFT.loading.value && curStore.claimIndex === oindex} onClick={() => curStore.claimNFT.call(item, oindex)} bg="white" size="sm">
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
            }
         </Box>
        </Flex>
        {/* steps */}
        <Flex w="100%" flexDirection={{base: "column", lg: "row"}} pt={{base: "40px", lg: "2rem"}} pb={{base: "6rem", lg: '2rem'}} bg="rgba(255, 255, 255, 0.1);" justifyContent={"center"} alignItems="center" fontFamily={'Helvetica'} fontSize={'1.25rem'} fontWeight={400}>
          {
            curStore.data.ui.steps.map((item, index) => {
              return <Flex key={item.title} alignItems="center" flexDirection={{base: "column", lg: "row"}}>
                <Box w={{base: "90%", lg: "21.875rem"}} textAlign={'center'} pb="24px">
                  <Image src={item.image} alt="" width="4rem" mb="1rem" mx="auto"></Image>
                  {item.href ? <a href={item.href} rel="noreferrer" target="_blank">
                    <Text whiteSpace={{base: "normal", lg: "pre-line"}}>{item.description}</Text>
                  </a> : <Text whiteSpace={{base: "normal", lg: "pre-line"}}>{item.description}</Text>}
                </Box>
                {index < curStore.data.ui.steps.length - 1 && <Image display={{base: "none", lg: "block"}} src="/images/right.png" alt="" width="2rem" h="2rem" flex="none" mx="1rem"></Image>}
                {index < curStore.data.ui.steps.length - 1 &&<Image display={{base: "block", lg: "none"}} src="/images/down.png" alt="" width="2rem" h="2rem" flex="none" my="1rem"></Image>}
              </Flex>
            })
          }
          {/* <Box w={{base: "90%", lg: "21.875rem"}} textAlign={'center'} pb="24px">
            <Image src="/images/step1.png" alt="" width="4rem" mb="1rem" mx="auto"></Image>
            <a href="https://iopay.me" rel="noreferrer" target="_blank">
              <Text whiteSpace={{base: "normal", lg: "pre-line"}}>{`Download ioPay Wallet`}</Text>
            </a>
          </Box>
          <Image display={{base: "none", lg: "block"}} src="/images/right.png" alt="" width="2rem" h="2rem" flex="none" mx="1rem"></Image>
          <Image display={{base: "block", lg: "none"}} src="/images/down.png" alt="" width="2rem" h="2rem" flex="none" my="1rem"></Image>
          <Box w={{base: "90%", lg: "21.875rem"}} textAlign={'center'}>
            <Image src="/images/step2.png" alt="" width="4rem" mb="1rem" mx="auto"></Image>
            <Text whiteSpace={{base: "normal", lg: "pre-line"}}>{`Enable W3bstream in ioPay \n Bind Geo Location to Wallet`}</Text>
          </Box>
          <Image display={{base: "none", lg: "block"}} src="/images/right.png" alt="" width="2rem" h="2rem" flex="none" mx="1rem"></Image>
          <Image display={{base: "block", lg: "none"}} src="/images/down.png" alt="" width="2rem" h="2rem" flex="none" my="1rem"></Image>
          <Box w={{base: "90%", lg: "21.875rem"}} textAlign={'center'} pb="24px">
            <Image src="/images/step3.png" alt="" width="4rem" mb="1rem" mx="auto"></Image>
            Claim NFT
          </Box> */}
        </Flex>
      </Flex>
    </Box>
  );
});

export default Template;
