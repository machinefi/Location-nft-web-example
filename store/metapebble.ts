import axios from "axios";
import moment from "moment";
import { makeAutoObservable } from "mobx";
import RootStore from "./root";
import getConfig from "next/config";
import { SiweMessage } from "siwe";
import { BigNumber } from "bignumber.js";
import toast from "react-hot-toast";
import { PromiseState } from "./standard/PromiseState";
import LocationNFTABI from "../constants/abis/LocationNFTABI.json";
import _ from "lodash";

const { publicRuntimeConfig } = getConfig();
const { NEXT_PUBLIC_APIURL } = publicRuntimeConfig;

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
  timestamp: number;
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
        address: "0xa8b44E4401e8A2c33cC9587b583498A037Bc8F04",
      },
    },
  };

  contractInstance: any;
  sdk: any;

  signStatus: boolean = false;
  owner: string = "";
  balance: number = 0;
  chainId: number = 4690;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setData(args: Partial<MpStore>) {
    Object.assign(this, args);
  }

  // Main function
  async init({ contract, chainId, address, sdk }: any) {
    this.setData({
      contractInstance: contract,
      chainId,
      owner: address,
      sdk,
    });
    const { message, sign } = await this.signInWithMetamask();
    await this.nftBalance.call();
    await this.places.call();
    await this.signData.call(message, sign);
    await this.claimLists.call();
    console.log("places===", message, sign, this.places, this.claimLists);
  }

  // create siwe message
  createSiweMessage = () => {
    const message = new SiweMessage({
      domain: globalThis.location.host,
      address: this.owner,
      statement: `Sign in Location Based NFT`,
      uri: globalThis.location.host,
      version: "1",
      chainId: this.chainId,
      expirationTime: moment().add(1, "minutes").toISOString(),
    });
    return message.prepareMessage();
  };

  // sign in with metamask
  signInWithMetamask = async () => {
    const message = this.createSiweMessage();
    const sign = await this.sdk?.wallet.sign(message);
    return { message, sign };
  };

  // init loading
  get initLoadinng() {
    return this.places.loading.value || this.signData.loading.value;
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
            scaled_latitude: new BigNumber(item.lat.toString()).toNumber(),
            scaled_longitude: new BigNumber(item.long.toString()).toNumber(),
            distance: item.maxDistance.toNumber(),
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
      const places = this.places.value;
      try {
        const response = await axios.post(`${NEXT_PUBLIC_APIURL}/api/get_sign_data_for_location`, {
          signature,
          message,
          owner: this.owner,
          from: `${moment().startOf("day").unix()}`,
          to: `${moment().endOf("day").unix()}`,
          locations: places,
        });
        const signData: SIGN_DATA[] = response.data.result.data;
        this.setData({ signStatus: true });

        return signData;
      } catch (error) {
        this.setData({ signStatus: false });
        toast.error("Signature is not valid");
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

  // claim NFT
  claimNFT = new PromiseState({
    name: "claim NFT",
    function: async (item: SIGN_DATA) => {
      const contract = this.contractInstance;
      try {
        const { scaled_latitude, scaled_longitude, distance, devicehash, timestamp, signature } = item;
        const res = await contract?.call("claim", scaled_latitude, scaled_longitude, distance, devicehash, timestamp, signature);

        if (res.receipt) {
          console.log("Receipt", res.receipt.blockHash)
          toast.success(res.receipt.blockHash);
          await this.nftBalance.call();
          await this.claimLists.call();
        }
      } catch (err) {
        console.log("error", err)
        toast.error("Claim failed");
      }
    },
  });
}
