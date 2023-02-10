import axios from "axios";
import moment from "moment";
import { makeAutoObservable } from "mobx";
import RootStore from "./root";
import { SiweMessage } from "siwe";
import { BigNumber } from "bignumber.js";
import toast from "react-hot-toast";
import { PromiseState } from "./standard/PromiseState";
import LocationNFTABI from "../constants/abis/LocationNFTABI.json";
import _ from "lodash";


type DEVICE_ITEM = {
  latitude: number;
  longitude: number;
  timestamp: number;
  distance: number;
  signature: string;
  devicehash: string;
};

type SIGN_DATA = {
  scaled_latitude: string;
  scaled_longitude: string;
  from: number;
  to: number;
  distance: number;
  signature: string;
  devicehash: string;
};

export class erc20Store {
  rootStore: RootStore;
  data = {
    "type": "erc20",
    "ui": {
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
          "image": "/images/step1.png",
          "href": "https://iopay.me/",
        },
        {
          "title": "Step 2",
          "description": "Enable W3bstream in ioPay Bind Geo Location to Wallet",
          "image": "/images/step2.png",
          "href": null
        },
        {
          "title": "Step 3",
          "description": "Claim Token",
          "image": "/images/step3.png",
          "href": null
        }
      ],
      "nft": null
    },
    "contract": {
      "4690": {
        "abi":[
          {
            "inputs": [
              {
                "internalType": "int256",
                "name": "_lat",
                "type": "int256"
              },
              {
                "internalType": "int256",
                "name": "_long",
                "type": "int256"
              },
              {
                "internalType": "uint256",
                "name": "_maxDistance",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "_startTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "_endTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "_verifier",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "holder",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "bytes32",
                "name": "deviceHash",
                "type": "bytes32"
              },
              {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "name": "Claimed",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
          },
          {
            "inputs": [],
            "name": "AMOUNT_PER_DEVICE",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "distance",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "deviceHash",
                "type": "bytes32"
              },
              {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
              }
            ],
            "name": "claim",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address payable",
                "name": "holder",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "distance",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "deviceHash",
                "type": "bytes32"
              },
              {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
              }
            ],
            "name": "claim",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "claimFee",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "claimable",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "bytes32",
                "name": "deviceHash_",
                "type": "bytes32"
              }
            ],
            "name": "claimed",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "endTimestamp",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "lat",
            "outputs": [
              {
                "internalType": "int256",
                "name": "",
                "type": "int256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "long",
            "outputs": [
              {
                "internalType": "int256",
                "name": "",
                "type": "int256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "maxDistance",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "refund",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "startTimestamp",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
              }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "verifier",
            "outputs": [
              {
                "internalType": "contract IMetapebbleDataVerifier",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "stateMutability": "payable",
            "type": "receive"
          }
        ],
        "address": "0x5F20fB1baA05c4E9975EF26eb73778557bB26ED7",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "abi": [],
        "address": "",
        "API_URL":"https://geo.w3bstream.com"
      }
    }
  }
  contractInstance: any;
  sdk: any;
  disconnect: any;

  signStatus: boolean = false;
  owner: string = "";
  balance: number = 0;
  chainId: number = 4689;
  loading: boolean = true;
  claimIndex: number = 0;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setData(args: Partial<erc20Store>) {
    Object.assign(this, args);
  }

  // Main function
  async init({ contract, chainId, address, sdk, disconnect }: any) {
    console.log('chainId===', chainId, address)
    this.setData({
      loading: true,
      contractInstance: contract,
      chainId,
      owner: address,
      sdk,
      disconnect
    });
    await this.place.call();
    await this.claimFee.call();
    console.log(this.place.value)
    const signResult = await this.signInWithMetamask();
    console.log('signResult', signResult)
    if(!signResult) return false;
    const { message, sign } = signResult;
    console.log('message', message, sign)
    await this.signData.call(message, sign);
    // await this.claimLists.call();
    // console.log("init===", this.claimFee.value);
  }

  // create siwe message
  createSiweMessage = () => {
    const message = new SiweMessage({
      domain: globalThis.location.host,
      address: this.owner,
      statement: `Sign in Location Based NFT The application will know if you were located in one of the following regions in the time range below:locations:${this.place.value?.feature}`,
      uri: globalThis.location.origin,
      version: "1",
      chainId: this.chainId,
      expirationTime: moment().add(1, "minutes").toISOString(),
    });
    return message.prepareMessage();
  };

  // sign in with metamask
  signInWithMetamask = async () => {
    try {
      const message = this.createSiweMessage();
      const sign = await this.sdk?.wallet.sign(message);
      return { message, sign };
    } catch (err) {
      this.disconnect();
      this.setData({ loading: false })
      console.log("err===", err);
      return null
    }
  };

  // init loading
  get initLoadinng() {
    return  this.place.loading.value || this.signData.loading.value;
  }

  // get places from contract and format places
  place = new PromiseState({
    name: "get query places from contract",
    function: async () => {
      const contract = this.contractInstance;
      console.log('lat', contract)
      const lat = await contract?.call("lat");
      console.log('lat', lat)
      const long = await contract?.call("long");
      const maxDistance = await contract?.call("maxDistance");
      const startTimestamp = await contract?.call("startTimestamp");
      const endTimestamp = await contract?.call("endTimestamp");
      let place = {
        from: startTimestamp.toNumber(),
        to: endTimestamp.toNumber(),
        scaled_latitude: new BigNumber(long.toString()).toNumber(),
        scaled_longitude: new BigNumber(lat.toString()).toNumber(),
        distance: maxDistance.toNumber(),
        feature: `from ${startTimestamp.toNumber()} to ${endTimestamp.toNumber()} within ${maxDistance.toNumber()} meter from [${new BigNumber(lat.toString()).div(1e6).toNumber()}, ${new BigNumber(long.toString()).div(1e6).toNumber()}]`
      }
      return place;
    },
  });

  // get claim origin list
  signData = new PromiseState({
    name: "get sign data from Metapebble API",
    value: [] as SIGN_DATA[],
    function: async (message: string, signature: string, contract = this.contractInstance) => {
      // @ts-ignore
      delete this.place.value?.feature
      try {
        const response = await axios.post(`${this.data.contract[this.chainId].API_URL}/api/pol`, {
          signature,
          message,
          owner: this.owner,
          locations: [this.place.value],
        });
        const signData: SIGN_DATA[] = response.data.result.data;
        this.setData({ signStatus: true, loading: false });

        return signData;
      } catch (error: any) {
        const err = error.response.data.error.message
        console.error('error', err)
        toast.error(`${err}`);
        this.setData({ signStatus: false, loading: false });
        return [];
      }
    },
  });
  claimLists = new PromiseState({
    name: "check claim list from contract",
    value: [] as DEVICE_ITEM[],
    function: async () => {
      if (!this.signData.value) return [];
      const contract = this.contractInstance;
      const list = await Promise.all(
        this.signData.value?.map(async (item) => {
          return {
            ...item,
            claimed: await contract?.call("claimed", item.devicehash),
          };
        })
      );
      console.log("formatDeviceAddClaimedStatus", list);
      return list;
    },
  });

  nftBalance = new PromiseState({
    name: "get nft balance",
    value: 0,
    function: async () => {
      const contract = this.contractInstance;
      const balance = await contract?.call("balanceOf", this.owner);
      return balance.toNumber();
    },
  });

  claimFee = new PromiseState({
    name: "get claim fee",
    value: 0,
    function: async () => {
      const contract = this.contractInstance;
      const fee = await contract?.call("claimFee");
      return fee
    },
  });

  // claim NFT
  claimNFT = new PromiseState({
    name: "claim NFT",
    function: async (item: SIGN_DATA, index: number) => {
      this.setData({claimIndex: index})
      const contract = this.contractInstance;
      try {
        const { scaled_latitude, scaled_longitude, distance, devicehash, from, to, signature } = item;
        const res = await contract?.call("claim", scaled_latitude, scaled_longitude, distance, devicehash, from, to, signature, {
          value: this.claimFee.value
        });

        if (res.receipt) {
          console.log("Receipt", res.receipt.blockHash);
          toast.success('Claimed Success!');
          await this.nftBalance.call();
          await this.claimLists.call();
        }
      } catch (err) {
        console.log("error", err);
        toast.error("Claim failed");
      }
    },
  });
}
