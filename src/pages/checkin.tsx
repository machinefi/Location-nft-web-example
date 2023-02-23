import { ConnectWallet, useSDK, useAddress, useChainId, useDisconnect, useContract } from "@thirdweb-dev/react";
import { useEffect, useMemo } from "react";
import { useStore } from "../store/index";
import { Button, Flex, Text, Box, Spinner, Image } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { metamaskUtils } from "../store/metaskUtils";
import Head from "next/head";
import { useRouter } from "next/router";
import { networkConfig } from "../config/chain";
import dynamic from "next/dynamic";

const OpenStreetMap = dynamic(() => import("../components/OpenStreatMap"), {
  ssr: false,
});

const Checkin = observer(() => {
  const { checkInStore } = useStore();

  const [address, chainId, sdk, disconnect] = [useAddress(), useChainId(), useSDK(), useDisconnect()];
  const { address: contractAddress, abi: contractAbi } = checkInStore.contract[chainId as number] || {};
  const { contract } = useContract(contractAddress, contractAbi);

  useEffect(() => {
    if (address && chainId && contract) {
      checkInStore.init({ address, chainId, sdk, disconnect, contract });
    }
  }, [chainId, address, contract]);

  useEffect(() => {
    if (chainId && chainId !== 4689 && chainId !== 4690 && checkInStore.defaultChainId) {
      metamaskUtils.setupNetwork(networkConfig[checkInStore.defaultChainId]);
    }
  }, [chainId, sdk]);

  return (
    // @ts-ignore
    <Box w="100vw" h="100vh" overflow={"hidden"} bg={checkInStore.data?.ui?.bgColor}>
      <Head>
        <title>{checkInStore.data.ui.title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="https://fonts.googlefonts.cn/css?family=Prompt" rel="stylesheet" />
      </Head>
      <Flex
        flexDirection={"column"}
        w="100vw"
        h="100vh"
        overflow={{ base: "auto", lg: "hidden" }}
        bgImage={{ base: "url(/images/bg_mobile.png)", lg: "url(/images/bg_pc.png)" }}
        bgSize={{ base: "100%", lg: "100% 100%" }}
        bgPosition={{ base: "0 210px", lg: "0 0" }}
        bgRepeat="no-repeat"
      >
        {/* logos */}
        <Flex
          justifyContent={{ base: "center", lg: "flex-start" }}
          ml={{ base: "0", md: "5%", xl: "10%" }}
          mt={{ base: "2.5rem", lg: "3rem", xl: "2rem", "2xl": "6rem" }}
          mb={{ base: "2rem", md: "2rem", lg: "2rem", xl: "2rem", "2xl": "4rem" }}
          alignItems={"center"}
        >
          {checkInStore.data.ui.logos.map((item) => (
            <Image key={item} mr={{ base: "1.5rem", lg: "4.375rem" }} flex="none" src={item} alt="" h="2.5rem"></Image>
          ))}
        </Flex>

        {/* center */}
        <Flex
          flex={{ base: "none", lg: "1" }}
          mt="3rem"
          ml={{ base: "0", md: "5%", xl: "10%" }}
          flexDirection={{ base: "column", lg: "row" }}
          justifyContent={{ base: "center", lg: "flex-start" }}
          alignItems={{ base: "center", lg: "flex-start" }}
        >
          <Box width="40%" height="50vh" mr="3%">
            <OpenStreetMap curStore={checkInStore} />
          </Box>
          <Box textAlign={{ base: "center", lg: "left" }} py={{ base: "40px", lg: 0 }} w={{ base: "90%", lg: "40%" }}>
            <Text display={{base:"none", lg:"block"}} whiteSpace={'pre-line'} fontSize={{base: "3.5rem", lg: "3rem", "2xl": "3.75rem"}} fontWeight={700} lineHeight={{md: "4rem", xl: "4rem", "2xl": "4.5rem"}} fontFamily={'Prompt'}>{`Location NFT`}</Text>
            <Text mb="2rem" display={{base:"none", lg:"block"}} whiteSpace={'pre-line'} fontSize="1.25rem" fontWeight={300} mt={{base: "1rem", lg: "1rem", "2xl": "1.5625rem"}} fontFamily={'Helvetica'}>
              {`Simply download ioPay wallet and connect your \n location  to claim the NFT!`}
            </Text>
            {!address ? (<ConnectWallet className="walletBtn" />) : (
              <Box>
                {checkInStore.mapPlaces.loading.value ? (
                  <Spinner size="xl" color="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" />
                ) : (
                  !checkInStore.mapPlaces?.value ? (
                    <Button w="max-content" h={{ base: "50px", lg: "4rem" }} borderRadius={0} bg="white">
                      <Text
                        bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)"
                        fontSize={{ base: "1rem", lg: "1rem" }}
                        fontWeight={700}
                        fontFamily="Helvetica"
                        backgroundClip={"text"}
                        css={{
                          textFillColor: "transparent",
                        }}
                      >
                        Please Click Map Set Position
                      </Text>
                    </Button>
                  ) : (
                    <Box flexDirection="column" alignItems={"center"} w="full">
                      {checkInStore.mapPlaces.value?.map((item: any, oindex: number) => {
                        return (
                          <Flex key={item.lat} mb="1rem" w="90%" alignItems={"center"} justifyContent={"space-between"}>
                            <Text>Place ID: {item.osm_id}</Text>
                            {item.claimed ? (
                              <Button bg="white" disabled size="sm">
                                <Text
                                  bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)"
                                  fontSize="0.875rem"
                                  fontWeight={700}
                                  fontFamily="Helvetica"
                                  backgroundClip={"text"}
                                  css={{
                                    textFillColor: "transparent",
                                  }}
                                >
                                  Claimed
                                </Text>
                              </Button>
                            ) : (
                              <Button
                                isLoading={checkInStore.mintOsmNFT.loading.value && checkInStore.claimIndex === oindex}
                                onClick={() => checkInStore.mintOsmNFT.call(item, oindex)}
                                bg="white"
                                size="sm"
                              >
                                <Text
                                  bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)"
                                  fontSize="0.875rem"
                                  fontWeight={700}
                                  fontFamily="Helvetica"
                                  backgroundClip={"text"}
                                  css={{
                                    textFillColor: "transparent",
                                  }}
                                >
                                  Mint OSM NFT
                                </Text>
                              </Button>
                            )}
                          </Flex>
                        );
                      })}
                    </Box>
                  )
                )}
              </Box>
            )}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

export default Checkin;
