export const metamaskUtils = {
  setupNetwork: async ({
    chainId,
    chainName,
    rpcUrls,
    blockExplorerUrls,
    nativeCurrency
  }: {
    chainId: number;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
  }) => {
    return new Promise(async (resolve, reject) => {
      //@ts-ignore
      const provider = window.ethereum;
      if (provider) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }]
          });
          resolve(true);
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          // @ts-ignore
          if (switchError.code === 4902) {
            try {
              await provider.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: `0x${chainId.toString(16)}`,
                    chainName,
                    // @ts-ignore
                    nativeCurrency,
                    rpcUrls,
                    blockExplorerUrls
                  }
                ]
              });
              resolve(true);
              return true;
            } catch (error) {
              reject(error);
              return false;
            }
          } else {
            reject(switchError);
          }
        }
      } else {
        console.error("Can't setup the BSC network on metamask because window.ethereum is undefined");
        reject(false);
        return false;
      }
    });
  }
};