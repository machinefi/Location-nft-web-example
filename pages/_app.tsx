import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
// This is the chainId your dApp will work on.
const activeChainId = ChainId.Mainnet;
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


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={activeChainId} chainRpc={{ [ChainId.Mainnet]: "https://babel-api.testnet.iotex.io" }}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
