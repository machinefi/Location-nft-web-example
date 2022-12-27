import { ConnectWallet, useContract, useSDK, useAddress, useChainId, Web3Button } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import { useStore } from "../store/index";
import { Button, Flex, Text, Box, Spinner } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import "../styles/Home.module.css";

const Home = observer(() => {
  const toast = useToast();
  const { mpStore } = useStore();

  const [address, chainId, sdk] = [useAddress(), useChainId(), useSDK()];
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
      toast({
        description: "Please switch to the IoTeX Testnet or Mainnet network",
        status: "warning",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [chainId]);

  return (
    <Flex h="100vh" flexDirection="column" justifyContent="center" alignItems="center">
      <Text className="title" fontSize={50}>
        Location Based <a href="">NFT</a>
      </Text>
      <Flex w={{ base: "100%", md: "545px" }} justifyContent="flex-start" flexDirection={"column"} mt="2rem" mb="3rem">
        <Text lineHeight={"1.65rem"}>
          Step 1:{" "}
          <a href="https://metapebble.app/metapebbleapp" rel="noreferrer" target="_blank">
            Download Metapebble
          </a>{" "}
          <br />
          Step 2: Register Metapebble and submit location
          <br />
          Step 3: Claim NFT
        </Text>
      </Flex>

      {!mpStore.initLoadinng && address && (
        <Flex mb="2rem" justifyContent="center" textAlign={"center"} fontWeight="500">
          Balance: {mpStore.nftBalance?.value}
        </Flex>
      )}
      {!address && (
        <Box w="200px">
          <ConnectWallet accentColor="#805ad5" />
        </Box>
      )}
      <Box>
        {mpStore.initLoadinng ? (
          <Spinner size="xl" color="purple" />
        ) : (
          address &&
          (!mpStore.signStatus ? (
            <Button colorScheme="purple" w="200px" disabled size="lg">
              Sign Failed
            </Button>
          ) : mpStore.claimLists.value?.length === 0 ? (
            <Button colorScheme="purple" mx="auto" w="200px" disabled size="lg">
              Incompatible
            </Button>
          ) : (
            <Box flexDirection="column" alignItems={"center"} w="full">
              {mpStore.claimLists.value?.map((item: any, oindex: number) => {
                return (
                  <Flex key={item.devicehash} mb="1rem" w="545px" alignItems={"center"} justifyContent={"space-between"}>
                    <Text>
                      Device Hash{item.claimed}：{`${item.devicehash.slice(0, 5)}...${item.devicehash.slice(item.devicehash.length - 5, item.devicehash.length)}`}
                    </Text>
                    {item.claimed ? (
                      <Button colorScheme="purple" disabled size="sm">
                        Claimed
                      </Button>
                    ) : (
                      <Button isLoading={mpStore.claimNFT.loading.value} colorScheme="purple" ml="1rem" size="sm" onClick={() => mpStore.claimNFT.call(item)}>
                        Claim
                      </Button>
                    )}
                  </Flex>
                );
              })}
            </Box>
          ))
        )}
      </Box>
    </Flex>
  );
});

export default Home;
