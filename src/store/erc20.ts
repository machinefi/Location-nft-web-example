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
import { request, gql } from 'graphql-request'
import { BooleanState } from './standard/base';

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
  defaultNetwork: 4690
  data = {
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
  async init({ chainId, address, sdk, disconnect, name }: any) {
    console.log('chainId===', chainId, address, name)
    if(name === '') return;
    this.setData({
      loading: true,
      chainId,
      owner: address,
      sdk,
      disconnect,
      contractInstance: this.data.contract[name]
    });
    await this.places.call();
    console.log('this.placesTest.value', this.places.value)
    const signResult = await this.signInWithMetamask();
    console.log('signResult', signResult)
    if(!signResult) return false;
    const { message, sign } = signResult;
    console.log('message', message, sign)
    await this.signData.call(message, sign);
    await this.claimLists.call();
  }

  // create siwe message
  createSiweMessage = () => {
    // @ts-ignore
    const locations = this.places.value && this.places.value.length > 0 ? this.places.value.map(item => item.feature) : []
    console.log("locations===", locations);
    const message = new SiweMessage({
      domain: globalThis.location.host,
      address: this.owner,
      statement: `Sign in Location Based NFT The application will know if you were located in one of the following regions in the time range below:locations:${locations.join(',')}`,
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
    return  this.places.loading.value || this.signData.loading.value;
  }


  // get places from contract and format places
  places = new PromiseState({
    name: "get places from contract",
    function: async () => {
      const query = gql`{
        MetapebbleVerifiedDrop(calls:[{address: "${this.contractInstance[this.chainId].address}", chainId: ${this.chainId}}]) {
            lat
            long
            startTimestamp
            endTimestamp
            maxDistance
          }
        }
      `
      let data = await request('https://smartgraph.one/metapebble_demo/graphql', query)
      if(data) {
       let places = data.MetapebbleVerifiedDrop.map((item) => {
        let option = {
          from: Number(item.startTimestamp),
          to: Number(item.endTimestamp),
          scaled_latitude: new BigNumber(item.lat.toString()).toNumber(),
          scaled_longitude: new BigNumber(item.long.toString()).toNumber(),
          distance: Number(item.maxDistance),
          feature: `from ${item.startTimestamp} to ${item.endTimestamp} within ${item.maxDistance} meter from [${new BigNumber(item.lat.toString()).div(1e6).toNumber()}, ${new BigNumber(item.long.toString()).div(1e6).toNumber()}]`
        }
        // @ts-ignore
        return this.defaultNetwork === 4689 ? option : {
            imei:`1938473${Math.floor(Math.random() * 100)}`,
            ...option,
          }
        })
        return places
      }
    }
  })

  // get claim origin list
  signData = new PromiseState({
    name: "get sign data from Metapebble API",
    value: [] as SIGN_DATA[],
    function: async (message: string, signature: string) => {
      const places = this.places.value ? JSON.parse(JSON.stringify(this.places.value)).map(e => { delete e.feature; return e}) : [];
      console.log('places-----', this.places.value)
      try {
        let data = {
          signature,
          message,
          owner: this.owner,
          locations: places
        }
        // @ts-ignore
        const response = await axios.post(`${this.contractInstance[this.chainId].API_URL}/api/pol_auth`, this.defaultNetwork === 4689 ? data : {
          adminToken: '0x0ba6a6ce7712f69fbc560793f567f2c7c32b75ce83d37f565f184632c88d7fbb',
          owner: this.owner,
          locations: places
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
      const list = await Promise.all(
        this.signData.value?.map(async (item) => {
          await this.claimedStatus.call(item.devicehash)
          console.log('typeof', typeof this.claimedStatus.value !== "boolean" ?  JSON.parse(`${this.claimedStatus.value}`) :  this.claimedStatus.value)
          return {
            ...item,
            claimed: typeof this.claimedStatus.value !== "boolean" ?  JSON.parse(`${this.claimedStatus.value}`) :  this.claimedStatus.value,
          };
        })
      );
      console.log("formatDeviceAddClaimedStatus", list);
      return list;
    },
  });

  claimedStatus = new PromiseState({
    name: "check claimed status",
    value: false,
    function: async (devicehash: string) => {
      console.log('devicehash', devicehash)
      const query = gql`{
        MetapebbleVerifiedDrop(calls:[{address: "${this.contractInstance[this.chainId].address}",chainId: ${this.chainId}}]) {
            claimed(deviceHash_: "${devicehash}")
          }
        }
      `
      let data = await request('https://smartgraph.one/metapebble_demo/graphql', query)
      return data.MetapebbleVerifiedDrop[0].claimed
    }
  })

  // claim token
  claimNFT = new PromiseState({
    name: "claim token",
    function: async (item: SIGN_DATA, index: number) => {
      this.setData({claimIndex: index})
      try {
        const {  distance, devicehash, signature } = item;
        // `${this.contractInstance[this.chainId].API_URL}/api/mint`
        const response = await axios.post("/api/mint", {
          holder: this.owner,
          deviceHash:devicehash,
          signature,
          distance: distance
        });
        if (response) {
          toast.success('Claimed Success!');
          await this.claimLists.call();
        }
      } catch (err) {
        console.log("error", err);
        toast.error("Claim failed");
      }
    },
  });
}
