import { makeAutoObservable } from "mobx";
import RootStore from "./root";
import { request, gql } from 'graphql-request'
import { BigNumber } from "bignumber.js";
import toast from "react-hot-toast";
import { PromiseState } from "./standard/PromiseState";
import {nftData} from '../config/chain'
import _ from "lodash";
import {GeostreamSDK} from '@w3bstream/geostream'
import axios from "axios"
import OsmNFTABI from '../constants/abis/OsmNFTABI.json'

type SIGN_DATA = {
  lat: string;
  lng: string;
  scaled_latitude: number;
  scaled_longitude: number;
  osm_id: string;
  osm_data: any;
};

export class checkInStore {
  rootStore: RootStore;
  defaultChainId: 4690
  data = nftData
  contract={
    "4690": {
      "address": "0x3e97bd535ED9924a5a99fE8E6D8455693Dc2fB13",
      abi: OsmNFTABI
    },
    "4689": {
      "address": "",
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
  siteName: string = "";

  geoStreamSdk: GeostreamSDK

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  setData(args: Partial<checkInStore>) {
    Object.assign(this, args);
  }

  // Main function
  async init({ address, chainId,  sdk, disconnect, contract }: any) {
    this.setData({
       sdk, owner:address, chainId, disconnect, loading: true,
       contractInstance: contract
    });
  }

  // init loading
  get initLoadinng() {
    return  this.mapPlaces.loading.value
  }

  // click map set location
  mapPlaces = new PromiseState({
    name: "map places",
    function: async (location) => {
      const {lat, lng} = location
      const osmData = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      const nftBalance = await this.contractInstance.call('balanceOf', this.owner, osmData.data.osm_id)
      console.log("osmData", osmData.data, nftBalance.toNumber())
      return [{
        lat: new BigNumber((lat * 1000000).toFixed(0)).toNumber(),
        lng: new BigNumber((lng * 1000000).toFixed(0)).toNumber(),
        scaled_latitude: lat,
        scaled_longitude: lng,
        osm_id: osmData.data.osm_id,
        osm_data: osmData.data,
        claimed: nftBalance.toNumber() > 0
      }]
    }
  })

  // mint Osm NFT
  mintOsmNFT = new PromiseState({
    name: "mint Osm NFT",
    function: async (item: SIGN_DATA, index: number) => {
      this.setData({claimIndex: index})
      try {
        const contract = this.contractInstance
        const res = await contract.call('mint', this.owner, item.osm_id.toString())
        if (res.receipt) {
          console.log("Receipt", res.receipt.blockHash);
          toast.success('Claimed Success!');
          this.mapPlaces.call({lat: item.scaled_latitude, lng: item.scaled_longitude})
        }
      } catch (err) {
        console.log("error", err);
        toast.error('Claimed Failed!');
      }
    },
  });

  smartQueryFun = new PromiseState({
    name: "smart query",
    function: async (eventName, value?) => {
      const query = gql`{
        OpenStreetMapNFT(calls:[{address: "${this.contract[this.chainId].address}",chainId: ${this.chainId}}]) {
            ${eventName}
          }
        }
      `
      let data = await request('https://smartgraph.one/metapebble_demo/graphql', query, value)
      return data['OpenStreetMapNFT'][0]
    }
  })
}