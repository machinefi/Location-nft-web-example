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

export class MpStore {
  rootStore: RootStore;
  contract = {
    LocationNFT: {
      4690: {
        abi: LocationNFTABI,
        address: "0x775B56a6E3b13A19404FC186098f564B19715Ab9",
        API_URL:"https://geo-test.w3bstream.com"
      },
      4689: {
        abi: LocationNFTABI,
        address: "0x68E1099c384a2D341d23D5e946138835882AF3ee",
        API_URL:"https://geo.w3bstream.com"
      }
    },
  };

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

  setData(args: Partial<MpStore>) {
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
    await this.nftBalance.call();
    await this.places.call();
    await this.claimFee.call();
    const signResult = await this.signInWithMetamask();
    console.log('signResult', signResult)
    if(!signResult) return false;
    const { message, sign } = signResult;
    console.log('message', message, sign)
    await this.signData.call(message, sign);
    await this.claimLists.call();
    console.log("init===", this.claimFee.value);
  }

  // create siwe message
  createSiweMessage = () => {
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
    name: "get query places from contract",
    function: async () => {
      const contract = this.contractInstance;
      const result = await contract?.call("palceCount");
      const count = result.toNumber();
      let places = await Promise.all(
        _.range(0, count).map(async (i) => {
          const hash = await contract?.call("placesHash", i);
          const item = await contract?.call("places", hash);
          return {
            from: item.startTimestamp.toNumber(),
            to: item.endTimestamp.toNumber(),
            scaled_latitude: new BigNumber(item.lat.toString()).toNumber(),
            scaled_longitude: new BigNumber(item.long.toString()).toNumber(),
            distance: item.maxDistance.toNumber(),
            feature: `from ${item.startTimestamp.toNumber()} to ${item.endTimestamp.toNumber()} within ${item.maxDistance.toNumber()} meter from [${new BigNumber(item.lat.toString()).div(1e6).toNumber()}, ${new BigNumber(item.long.toString()).div(1e6).toNumber()}]`
          };
        })
      );
      return places;
    },
  });

  // get claim origin list
  signData = new PromiseState({
    name: "get sign data from Metapebble API",
    value: [] as SIGN_DATA[],
    function: async (message: string, signature: string, contract = this.contractInstance) => {
      const places = this.places.value ? JSON.parse(JSON.stringify(this.places.value)).map(e => { delete e.feature; return e}) : [];
      console.log("places===", places);
      try {
        const response = await axios.post(`${this.contract.LocationNFT[this.chainId].API_URL}/api/pol`, {
          signature,
          message,
          owner: this.owner,
          locations: places,
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
