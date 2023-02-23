import { publicConfig } from "./public";

export type NetworkObject = {
  name: string;
  chainId: number;
  rpcUrl: string;
  logoUrl: string;
  explorerUrl: string;
  explorerName: string;
  nativeCoin: string;
  // blockPerSeconds: number;
  // multicallAddr: string;
  type: "mainnet" | "testnet";
};

export const defaultNetworks: NetworkObject[] = [
  {
    name: "ETH",
    chainId: 1,
    rpcUrl: `https://rpc.ankr.com/eth`,
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/eth.svg",
    explorerUrl: "https://etherscan.io",
    explorerName: "EtherScan",
    nativeCoin: "ETH",
    type: "mainnet",
  },
  {
    name: "Polygon",
    chainId: 137,
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/matic.svg",
    rpcUrl: "https://polygon-rpc.com/",
    explorerUrl: "https://explorer-mainnet.maticvigil.com/",
    explorerName: "PolygonScan",
    nativeCoin: "MATIC",
    type: "mainnet",
  },
  {
    name: "BSC",
    chainId: 56,
    rpcUrl: "https://rpc.ankr.com/bsc",
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/bnb.svg",
    explorerUrl: "https://bscscan.com",
    explorerName: "BscScan",
    nativeCoin: "BNB",
    type: "mainnet",
  },
  {
    name: "IoTeX",
    chainId: 4689,
    rpcUrl: "https://babel-api.mainnet.iotex.io/",
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/iotx.svg",
    explorerUrl: "https://iotexscan.io",
    explorerName: "IotexScan",
    nativeCoin: "IOTX",
    type: "mainnet",
  },
  {
    name: "Avalanche",
    chainId: 43114,
    rpcUrl: "https://rpc.ankr.com/avalanche",
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/avax.svg",
    explorerUrl: "https://subnets.avax.network/",
    explorerName: "AVAXScan",
    nativeCoin: "AVAX",
    type: "mainnet",
  },
  {
    name: "Fantom",
    chainId: 250,
    rpcUrl: "https://rpc.ankr.com/fantom",
    logoUrl: "https://cryptologos.cc/logos/fantom-ftm-logo.svg",
    explorerUrl: "https://ftmscan.com/",
    explorerName: "FTMScan",
    nativeCoin: "FTM",
    type: "mainnet",
  },
  {
    name: "BSC Testnet",
    chainId: 97,
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/bnb.svg",
    explorerUrl: "https://testnet.bscscan.com",
    explorerName: "BscScan",
    nativeCoin: "BNB",
    type: "testnet",
  },
  {
    name: "ETH Kovan",
    chainId: 42,
    rpcUrl: `https://kovan.infura.io/v3/${publicConfig.infuraId}`,
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/eth.svg",
    explorerUrl: "https://kovan.etherscan.io",
    explorerName: "EtherScan",
    nativeCoin: "ETH",
    type: "testnet",
  },
  {
    name: "ETH Rinkeby",
    chainId: 4,
    rpcUrl: `https://rinkeby.infura.io/v3/${publicConfig.infuraId}`,
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/eth.svg",
    explorerUrl: "https://rinkeby.etherscan.io",
    explorerName: "EtherScan",
    nativeCoin: "ETH",
    type: "testnet",
  },
  {
    name: "IoTeX Testnet",
    chainId: 4690,
    rpcUrl: `https://babel-api.testnet.iotex.io`,
    logoUrl: "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa5/svg/icon/iotx.svg",
    explorerUrl: "https://testnet.iotexscan.io",
    explorerName: "IotexScan",
    nativeCoin: "IOTX",
    type: "testnet",
  },
];

export const rpcs = {
  4689: "https://babel-api.mainnet.iotex.io",
  4690: `https://babel-api.testnet.iotex.io`,
};

export const erc20Data = {
  "type": "erc20",
  "ui": {
    "bgColor": 'linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), linear-gradient(107.56deg, #26BD7E 0%, #0F33B2 100%);',
    "logos": [
      "/images/logo.png",
    ],
    "title": "Claim Your AES- \n W3bstream Token",
    "subtitle": "Simply download ioPay wallet and connect \n your location to claim the Token!",
    "tips": {
      "name": "View claim instructions >>>",
      "url": "https://docs.google.com/document/d/1kchVOHNmRUy5JfqLfeprCufgNmxnJlcj8M3_cnFrXyo/edit"
    },
    "steps": [
      {
        "title": "Step 1",
        "description": "Download ioPay wallet",
        "image": "/images/step_11.png",
        "href": "https://iopay.me/",
      },
      {
        "title": "Step 2",
        "description": "Enable W3bstream in ioPay Bind Geo Location to Wallet",
        "image": "/images/step_22.png",
        "href": null
      },
      {
        "title": "Step 3",
        "description": "Claim Token",
        "image": "/images/step_33.png",
        "href": null
      }
    ],
    "icon": {
      "image": "/images/iotex_nft.png",
      "bg": "/images/bg_nft_pic.png"
    }
  },
  "contract": {
    "aes": {
      "4690": {
        "address": "0x9Ef768a5b5D5fb2c68C26f8e1661d76f33E661cf",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "address": "0x270F2f9BfCd5Ae62df36411db1beD8a6d917c639",
        "API_URL":"https://geo.w3bstream.com"
      }
    },
    "map": {
      "4690": {
        "address": "0x9Ef768a5b5D5fb2c68C26f8e1661d76f33E661cf",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "address": "0x270F2f9BfCd5Ae62df36411db1beD8a6d917c639",
        "API_URL":"https://geo.w3bstream.com"
      }
    },
    "maintest": {
      "4690": {
        "address": "0x9Ef768a5b5D5fb2c68C26f8e1661d76f33E661cf",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "address": "0x270F2f9BfCd5Ae62df36411db1beD8a6d917c639",
        "API_URL":"https://geo.w3bstream.com"
      }
    },
    "airdrop": {
      "4690": {
        "address": "",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "address": "",
        "API_URL":"https://geo.w3bstream.com"
      }
    }
  }
}

export const nftData = {
  "type": "nft",
  "ui": {
    "bgColor": "linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)",
    "logos": [
      "http://localhost:3000/images/logo.png",
      "http://localhost:3000/images/logo_CES.png"
    ],
    "title": "Claim Your CES- \n W3bstream NFT",
    "subtitle": "Simply download ioPay wallet and connect your location to claim the NFT!",
    "tips": {
      "name": "View claim instructions >>>",
      "url": "https://docs.google.com/document/d/1kchVOHNmRUy5JfqLfeprCufgNmxnJlcj8M3_cnFrXyo/edit"
    },
    "steps": [
      {
        "title": "Step 1",
        "description": "Download ioPay wallet",
        "image": "http://localhost:3000/images/step1.png",
        "href": "https://iopay.me/"
      },
      {
        "title": "Step 2",
        "description": "Enable W3bstream in ioPay Bind Geo Location to Wallet",
        "image": "http://localhost:3000/images/step2.png",
        "href": null
      },
      {
        "title": "Step 3",
        "description": "Claim NFT",
        "image": "http://localhost:3000/images/step3.png",
        "href": null
      }
    ],
    "icon": {
      "image": "http://localhost:3000/images/badge.png",
      "bg": "http://localhost:3000/images/bg_nft_pic.png"
    }
  },
  "contract":{
    "ces": {
      "4690": {
        "address": "0x775B56a6E3b13A19404FC186098f564B19715Ab9",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "address": "0xbe050178c28885a0204fcfaC2A1039C34164f466",
        "API_URL":"https://geo.w3bstream.com"
      }
    },
    "map": {
      "4690": {
        "address": "0x9Ef768a5b5D5fb2c68C26f8e1661d76f33E661cf",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "address": "0x270F2f9BfCd5Ae62df36411db1beD8a6d917c639",
        "API_URL":"https://geo.w3bstream.com"
      }
    },
  }
}


export const networkConfig = {
  4690: {
    chainId: 4690,
    blockExplorerUrls: ['https://testnet.iotexscan.io'],
    chainName: 'IOTX Testnet',
    nativeCurrency: {
      decimals:  18,
      name: 'IOTX Testnet',
      symbol: 'IOTX'
    },
    rpcUrls: ['https://babel-api.testnet.iotex.io/']
  },
  4689: {
    chainId: 4689,
    blockExplorerUrls: ['https://iotexscan.io'],
    chainName: 'IoTeX',
    nativeCurrency: {
      decimals:  18,
      name: 'IOTX Mainnet',
      symbol: 'IOTX'
    },
    rpcUrls: ['https://babel-api.mainnet.iotex.io/']
  }
}