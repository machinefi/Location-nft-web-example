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
    <Box w="100vw" h="100vh" overflow={"hidden"} bg={"linear-gradient(107.56deg, #64D9EA 0%, #014FF0 100%);"}>
      <Head>
        <title>Check In demo </title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link href="https://fonts.googlefonts.cn/css?family=Prompt" rel="stylesheet" />
      </Head>
      <Flex
        w="100vw"
        h="100vh"
        overflow={{ base: "auto", lg: "hidden" }}
        bgImage={{ base: "url(/images/bg_check_mobile.png)", lg: "url(/images/bg_checkin.png)" }}
        bgSize={{ base: "100%", lg: "100% 100%" }}
        bgPosition={{ base: "0 0", lg: "0 0" }}
        bgRepeat="no-repeat"
        alignItems={{base: "flex-start", md: "center"}}
      >
        {/* center */}
        <Flex
          w={"full"}
          mt="3rem"
          flexDirection={{ base: "column", lg: "row" }}
          justifyContent={{ base: "center", lg: "center" }}
          alignItems={{ base: "center", lg: "flex-start" }}
        >
          <Box ml={{base: "3%", md: 0}} width={{ base: "94%", md: "40%", xl: "35%" }} height="50vh" mr={{base: '3%', md: "3%"}} borderRadius="10px" overflow={'hidden'}>
            {address && chainId && <OpenStreetMap curStore={checkInStore} chainId={chainId} address={address} />}
          </Box>
          <Box textAlign={{ base: "center", lg: "left" }} py={{ base: "40px", lg: 0 }} w={{ base: "90%", lg: "35%", xl: "30%" }}>
            <Text
              mb="2rem"
              whiteSpace={"pre-line"}
              fontSize={{ base: "1.5rem", lg: "3rem", "2xl": "3rem" }}
              fontWeight={700}
              lineHeight={{ md: "4rem", xl: "4rem", "2xl": "4.5rem" }}
              fontFamily={"Prompt"}
              textAlign="left"
            >{`Mint Location NFT`}</Text>
         
            {/* @ts-ignore */}
            <Tabs isFitted  variant="enclosed" index={checkInStore.tabIndex} onChange={(index) => checkInStore.setData({tabIndex: index})}>
              <TabList mb="1em" border="none">
                <Tab fontSize={'1.25rem'} fontWeight="700" bg="rgba(255, 255, 255, 0.1)" border="1px solid #fff" borderBottomLeftRadius="md" borderBottomRightRadius="0" borderTopRightRadius="0" _selected={{ color: "#0069f2",  borderColor: "#fff", bg: "#fff" }}>My NFT</Tab>
                <Tab fontSize={'1.25rem'} fontWeight="700" bg="rgba(255, 255, 255, 0.1)" border="1px solid #fff" borderBottomRightRadius="md" borderTopLeftRadius="0" borderColor="#fff" _selected={{ color: "#0069f2",  borderColor: "#fff", bg: "#fff" }}>Check In</Tab>
              </TabList>
              <TabPanels>
                <TabPanel padding="0">
                  <Accordion allowMultiple>
                    {/* @ts-ignore */}
                    {checkInStore.nftBalanceList.value?.length > 0 ? (
                      checkInStore.nftBalanceList.value?.map((item) => {
                        return (
                          <AccordionItem key={item.osm_id} border={"none"}>
                            <h2>
                              <AccordionButton>
                                <Box as="span" flex="1" textAlign="left">
                                  Location ID: {item.osm_id}
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                            </h2>
                            <AccordionPanel p="0">
                              <Flex fontSize={'1rem'} gap="1rem" fontWeight={400} flexDirection={"column"} alignItems="flex-start" justifyContent="flex-start">
                                <Flex mt="1rem">
                                  <Text flex="none" textAlign={'left'} pl="1rem" w="90px">Name: </Text>
                                  <Text textAlign="left">{item.osm_data?.display_name}</Text>
                                </Flex>
                                <Flex alignItems={'center'}>
                                  <Text textAlign={'left'} pl="1rem" flex="none" w="90px">Lat.: </Text>
                                  <Text >{item.scaled_latitude.toFixed(4)}</Text>
                                </Flex>
                                <Flex alignItems={'center'}>
                                  <Text textAlign={'left'} pl="1rem" flex="none" w="90px">Long.: </Text>
                                  <Text>{item.scaled_longitude.toFixed(4)}</Text>
                                </Flex>
                              </Flex>
                            </AccordionPanel>
                          </AccordionItem>
                        );
                      })
                    ) : (
                      <Text fontSize={"1rem"} color="rgba(255, 255,255,0.5)" mt="3rem" w={"full"} align="center">
                        Nothing
                      </Text>
                    )}
                  </Accordion>
                </TabPanel>
                <TabPanel p="0">
                  {!address ? (
                    <Flex justifyContent={"center"} mt={{base: "3rem", md: "10vh"}}>
                      <ConnectWallet className="checkBtn" />
                    </Flex>
                  ) : (
                    <Box>
                      {checkInStore.mapPlaces.loading.value ? (
                        <Flex justifyContent={'center'} alignItems="center" mt={{base: "3rem", md: "10vh"}}>
                          <Spinner size="xl" color="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" />
                        </Flex>
                      ) : !checkInStore.mapPlaces?.value ? (
                        <Flex justifyContent={"center"} mt={{base: "3rem", md: "10vh"}}>
                          <Button w="max-content" padding={'7px 24px'} borderRadius={'5px'} bg="white" fontSize={'18px'} fontWeight="700" color="#306CE9">
                            {checkInStore.positionConfig[checkInStore.positionStatus]}
                          </Button>
                        </Flex>
                      ) : (
                        <Box flexDirection="column" mt="2rem" alignItems={"center"} w="full" p={0}>
                          {checkInStore.mapPlaces.value?.map((item: any, oindex: number) => {
                            return (
                              <Box key={item.osm_id}>
                                <Flex key={item.lat} mb="1rem" w="100%" alignItems={"center"} justifyContent={"space-between"}>
                                  <Flex alignItems={'flex-start'}>
                                    <Text flex="none" w="90px">Location ID: </Text>
                                    <Text fontSize={'1rem'} fontWeight={400}>{item.osm_id}</Text>
                                  </Flex>
                                  <Button
                                    isLoading={checkInStore.mintOsmNFT.loading.value && checkInStore.claimIndex === oindex}
                                    onClick={() => checkInStore.mintOsmNFT.call(item, oindex)}
                                    bg="white" size="sm"
                                    padding={'0 16px'}
                                    fontSize={'16px'} fontWeight="700" color="#306CE9"
                                  >
                                    Mint
                                  </Button>
                                </Flex>
                                <Flex fontSize={'1rem'} gap="1rem" fontWeight={400} flexDirection={"column"} alignItems="flex-start" justifyContent="flex-start">
                                  <Flex>
                                    <Text flex="none" textAlign={'left'} w="90px">Name: </Text>
                                    <Text textAlign="left">{item.osm_data?.display_name}</Text>
                                  </Flex>
                                  <Flex alignItems={'center'}>
                                    <Text textAlign={'left'} flex="none" w="90px">Lat.: </Text>
                                    <Text >{item.scaled_latitude.toFixed(4)}</Text>
                                  </Flex>
                                  <Flex alignItems={'center'}>
                                    <Text textAlign={'left'} flex="none" w="90px">Long.: </Text>
                                    <Text>{item.scaled_longitude.toFixed(4)}</Text>
                                  </Flex>
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
