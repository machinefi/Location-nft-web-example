import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { Toaster } from 'react-hot-toast';
import "../styles/globals.css";

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
      padding: 0
    },
    // styles for the `a`
    a: {
      color: '#fff',
      textDecoration: 'underline',
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
}})


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider desiredChainId={1} chainRpc={{ 
      [ChainId.Mainnet]: "https://babel-api.mainnet.iotex.io",
      // @ts-ignore
      4690: "https://babel-api.testnet.iotex.io",
      4689: "https://babel-api.mainnet.iotex.io",
     }} supportedChains={[1, 4689, 4690]}>
      <ChakraProvider theme={theme}>
        <Toaster />
        <Component {...pageProps} />
      </ChakraProvider>
    </ThirdwebProvider>
  );
}

export default MyApp;
