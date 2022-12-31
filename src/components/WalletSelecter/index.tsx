import React from 'react';
import { observer, useLocalObservable, useLocalStore } from 'mobx-react-lite';
import { useStore } from '../../store/index';
import { useWeb3React } from '@web3-react/core';
import { injected, walletconnect } from '../../lib/web3-react';
import { Button, Flex, Text, Menu, MenuButton, MenuList, MenuItem, Box, Spinner, Image, AvatarGroup, Avatar } from "@chakra-ui/react";
import { StringState } from '../../store/standard/base';

import { useConnect } from 'wagmi';

export const WalletSelecter = observer(() => {
  const { god } = useStore();
  const { active, activate } = useWeb3React();
  const { connect, connectors, error, isLoading, pendingConnector } = useConnect();

  const store = useLocalObservable(() => ({
    network: new StringState<'mainnet' | 'testnet'>({ value: 'mainnet' }),
    get visible() {
      return god.eth.connector.showConnector;
    },
    get networks() {
      return god.currentNetwork.chain.set.filter((i) => i.type == store.network.value);
    },

    close() {
      god.eth.connector.showConnector = false;
    },
    async setChain(val) {
      god.switchChain(val);
    },
    connectInejct() {
      // activate(injected);
      connect({ connector: connectors[0] });
      // god.eth.connector.latestProvider.save('inject');
    },
    onWalletConnect() {
      activate(walletconnect);
      god.eth.connector.latestProvider.save('walletConnect');
    },
  }));

  const config = [
    {
      title: 'Metamask',
      icon: '/images/metamask.svg'
    },
    {
      title: 'ioPay',
      icon: '/images/iopay.svg'
    },
    {
      title: 'Trust',
      icon: '/images/trustwallet.svg'
    },
    {
      title: 'Math',
      icon: '/images/mathwallet.svg'
    },
    {
      title: 'imToken',
      icon: '/images/imtoken.svg'
    }
  ];

  const names = config.map((item) => item.title).join(', ');

  return (
    <Menu>
      <MenuButton as={Button}  w={{base: "14.275rem", lg: "20rem"}} h={{base: "50px", lg: "4rem"}} borderRadius={0}  bg="white" _hover={{opacity: 1}} _focus={{opacity: 1}}>
        <Text bg="linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)" fontSize={{base: "1rem", lg:"1.5rem"}} fontWeight={700} fontFamily="Helvetica" backgroundClip={'text'} css={{
          textFillColor: "transparent"
        }}>Connect Wallet</Text>
      </MenuButton>
      <MenuList w={{base: "14.275rem", lg: "20rem"}} bg="rgb(0, 0, 0)" py="0" borderRadius={0}>
        <MenuItem onClick={store.connectInejct} h="4.5rem" bg="rgb(0, 0, 0)" _hover={{bg: "rgba(255, 255, 255, 0.15)"}} px="0.5rem">
          {!god.currentNetwork.account && (
          <Flex onClick={store.connectInejct} justifyContent={'space-between'} style={{ cursor: 'pointer', borderRadius: '8px', background: 'rgba(0,0,0,0.1)' }}>
            <Box>
              <Text fontSize={'1rem'}>Browser Wallet</Text>
              <Text color="gray.500" style={{ fontSize: '12px', lineHeight: '16.38px', fontStyle: 'normal', fontWeight: '500' }}>
                ({names})
              </Text>
            </Box>
            <AvatarGroup size="sm">
              {config.map((item, index) => {
                return <Avatar key={item.title} src={item.icon} />;
              })}
            </AvatarGroup>
          </Flex>
        )}
        </MenuItem>
        <MenuItem onClick={store.onWalletConnect} h="4.5rem" bg="rgb(0, 0, 0)" _hover={{bg: "rgba(255, 255, 255, 0.15)"}} px="0.5rem" display={'flex'} alignItems="center" justifyContent="space-between">
          <Text fontSize={'1rem'}>WalletConnect</Text>
          <Avatar size="sm" src="/images/walletConnect.svg" />
        </MenuItem>
      </MenuList>
    </Menu>
  );
});
