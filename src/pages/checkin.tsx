import { ConnectWallet, useSDK, useAddress, useChainId, useDisconnect, useContract } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { useStore } from "../store/index";
import { Button, Flex, Text, Box, Spinner, Tabs, TabList, TabPanels, Tab, TabPanel, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react";
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
  const [tabIndex, setTabIndex] = useState(1);

  const [address, chainId, sdk, disconnect] = [useAddress(), useChainId(), useSDK(), useDisconnect()];
  const { address: contractAddress, abi: contractAbi } = checkInStore.contract[chainId as number] || {};
  const { contract } = useContract(contractAddress, contractAbi);

  useEffect(() => {
    if (address && chainId && contract) {
      checkInStore.init({ address, chainId, sdk, disconnect, contract });
    }
  }, [chainId, address, contract]);

  useEffect(() => {
    if (chainId && chainId !== 4690 && checkInStore.defaultChainId) {
      metamaskUtils.setupNetwork(networkConfig[checkInStore.defaultChainId]);
    }
  }, [chainId, checkInStore.defaultChainId]);

  return (
    // @ts-ignore
    <Box w="100vw" h="100vh" overflow={"hidden"} bg={"linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)),linear-gradient(107.56deg, #00fffc 0%, #0041ff 100%)"}>
      <Head>
        <title>Check In demo </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="https://fonts.googlefonts.cn/css?family=Prompt" rel="stylesheet" />
      </Head>
      <Flex
        w="100vw"
        h="100vh"
        overflow={{ base: "auto", lg: "hidden" }}
        bgImage={{ base: "url(/images/bg_mobile.png)", lg: "url(/images/bg_pc.png)" }}
        bgSize={{ base: "100%", lg: "100% 100%" }}
        bgPosition={{ base: "0 210px", lg: "0 0" }}
        bgRepeat="no-repeat"
        alignItems={"center"}
      >
        {/* center */}
        <Flex
          w={"full"}
          mt="3rem"
          ml={{ base: "0", md: "5%", xl: "10%" }}
          flexDirection={{ base: "column", lg: "row" }}
          justifyContent={{ base: "center", lg: "flex-start" }}
          alignItems={{ base: "center", lg: "flex-start" }}
        >
          <Text
            display={{ base: "block", lg: "none" }}
            mb="2rem"
            whiteSpace={"pre-line"}
            fontSize={{ base: "1.25rem" }}
            fontWeight={700}
            lineHeight={{ md: "4rem", xl: "4rem", "2xl": "4.5rem" }}
            fontFamily={"Prompt"}
          >{`Mint OpenStreetMap NFT`}</Text>
          <Box margin={"auto"} width={{ base: "100%", md: "40%" }} height="50vh" mr="3%">
            <OpenStreetMap curStore={checkInStore} address={address} />
          </Box>
          <Box textAlign={{ base: "center", lg: "left" }} py={{ base: "40px", lg: 0 }} w={{ base: "90%", lg: "40%" }}>
            <Text
              display={{ base: "none", lg: "block" }}
              mb="2rem"
              whiteSpace={"pre-line"}
              fontSize={{ base: "3.5rem", lg: "3rem", "2xl": "3rem" }}
              fontWeight={700}
              lineHeight={{ md: "4rem", xl: "4rem", "2xl": "4.5rem" }}
              fontFamily={"Prompt"}
            >{`Mint OpenStreetMap NFT`}</Text>
            {/* <Text
              mb="2rem"
              display={{ base: "none", lg: "block" }}
              whiteSpace={"pre-line"}
              fontSize="1.25rem"
              fontWeight={300}
              mt={{ base: "1rem", lg: "1rem", "2xl": "1.5625rem" }}
              fontFamily={"Helvetica"}
            >
              {`Simply download ioPay wallet and connect your \n location  to claim the NFT!`}
            </Text> */}
            <Tabs isFitted variant="enclosed" defaultIndex={tabIndex} onChange={(index) => setTabIndex(index)}>
              <TabList mb="1em">
                <Tab _selected={{ color: "#0069f2", fontSize: "1rem", fontWeight: 700, borderColor: "#fff", bg: "#fff" }}>My NFT</Tab>
                <Tab _selected={{ color: "#0069f2", fontSize: "1rem", fontWeight: 700, borderColor: "#fff", bg: "#fff" }}>Check In</Tab>
              </TabList>
              <TabPanels>
                <TabPanel padding="0">
                  <Accordion allowMultiple>
                    {checkInStore.nftBalanceList.value ? (
                      checkInStore.nftBalanceList.value?.map((item) => {
                        return (
                          <AccordionItem key={item} border={"none"}>
                            <h2>
                              <AccordionButton>
                                <Box as="span" flex="1" textAlign="left">
                                  Place ID: {item.osm_id}
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                              <Flex flexDirection={"column"} alignItems="flex-start" justifyContent="flex-start">
                                <Text>Display Name: {item.osm_data?.display_name}</Text>
                                <Text mt={"1rem"}>
                                  Latitude: {item.scaled_latitude}, Longitude: {item.scaled_longitude}
                                </Text>
                              </Flex>
                            </AccordionPanel>
                          </AccordionItem>
                        );
                      })
                    ) : (
                      <Text fontSize={"2rem"} color="rgba(255, 255,255,0.5)" mt="3rem" w={"full"} align="center">
                        Nothing
                      </Text>
                    )}
                  </Accordion>
                </TabPanel>
                <TabPanel p="0">
                  {!address ? (
                    <Flex justifyContent={"center"}>
                      <ConnectWallet className="walletBtn" />
                    </Flex>
                  ) : (
                    <Box>
                      {checkInStore.mapPlaces.loading.value ? (
                        <Spinner size="xl" color="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" />
                      ) : !checkInStore.mapPlaces?.value ? (
                        <Flex justifyContent={"center"}>
                          <Button minW={"50%"} w="max-content" h={{ base: "50px", lg: "4rem" }} borderRadius={0} bg="white">
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
                              {checkInStore.positionConfig[checkInStore.positionStatus]}
                            </Text>
                          </Button>
                        </Flex>
                      ) : (
                        <Box flexDirection="column" mt="2rem" alignItems={"center"} w="full" p={0}>
                          {checkInStore.mapPlaces.value?.map((item: any, oindex: number) => {
                            return (
                              <Box key={item.osm_id}>
                                <Flex key={item.lat} mb="1rem" w="100%" alignItems={"center"} justifyContent={"space-between"}>
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
                                <Flex flexDirection={"column"} alignItems="flex-start" justifyContent="flex-start">
                                  <Text>Display Name: {item.osm_data?.display_name}</Text>
                                  <Text mt={"1rem"}>
                                    Latitude: {item.scaled_latitude}, Longitude: {item.scaled_longitude}
                                  </Text>
                                </Flex>
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
});

export default Checkin;
