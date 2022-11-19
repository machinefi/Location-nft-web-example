import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "./styles/globals.css";
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const activeChainId = ChainId.Mainnet

const container = document.getElementById("root");
const root = createRoot(container!);

const colors = {
  model: 'dark',
  bg: '#0000',
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

const theme = extendTheme({ colors, styles: {
  global: {
    // styles for the `body`
    body: {
      bg: '#0f1318',
      color: 'white',
    },
    // styles for the `a`
    a: {
      color: 'teal.500',
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
}})



root.render(
  <React.StrictMode> 
    <ThirdwebProvider desiredChainId={activeChainId} chainRpc={{ [ChainId.Mainnet]: "https://babel-api.testnet.iotex.io" }}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </ThirdwebProvider>
  </React.StrictMode>
);
