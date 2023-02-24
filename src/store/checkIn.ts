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
  defaultChainId = 4690;
  data = nftData
  contract={
    "4690": {
      "address": "0x3e97bd535ED9924a5a99fE8E6D8455693Dc2fB13",
      abi: OsmNFTABI
    },
    "4689": {
      "address": "",
      abi: OsmNFTABI
    }
  }

  contractInstance: any;
  sdk: any;
  disconnect: any;

  signStatus: boolean = false;
  owner: string = "";
  balance: number = 0;
  chainId: number = 4690;
  loading: boolean = true;
  claimIndex: number = 0;
  siteName: string = "";
  positionStatus : number = 0; // 0 loading  1 refuse  2 allow
  positionConfig = {
    0: 'Please Waiting...',
    1: 'Please Click Map Set Position',
    2: 'waiting'
  }
  isClaimed: boolean = false;
  tabIndex: number = 1;

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
    if(address) {
      this.nftBalanceList.call()
    }
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
      const isClaimed = nftBalance.toNumber() > 0
      const place = {
        lat: new BigNumber((lat * 1000000).toFixed(0)).toNumber(),
        lng: new BigNumber((lng * 1000000).toFixed(0)).toNumber(),
        scaled_latitude: lat,
        scaled_longitude: lng,
        osm_id: osmData.data.osm_id,
        osm_data: osmData.data,
        claimed: nftBalance.toNumber() > 0
      }
      console.log("osmData", osmData.data, nftBalance.toNumber())
      if(isClaimed) {
        this.setData({tabIndex: 0})
        const list = this.nftBalanceList.value || []
        if(list.length > 0) {
          // @ts-ignore
          const isHave = this.nftBalanceList.value.filter((o) => o.osm_id === place.osm_id)
          if(isHave.length === 0) {
            list.push(place)
            this.nftBalanceList.setValue(Array.from(new Set(list)))
          }
        } else {
          list.push(place)
          this.nftBalanceList.setValue(Array.from(new Set(list)))
        }
      }
      return isClaimed ? [] : [place]
    }
  })

  // get nft balance
  nftBalanceList = new PromiseState({
    name: "nft balance list",
    value: [] as any[],
    function: async () => {
      // ${this.owner}
      const { data } = await axios.get(`https://nft.iopay.me/account/4690/own/0x7890256910829ecc1cdd50ab50b1e92ec90a28da?skip=0&first=1000&type=1155`)
      console.log("res", data)
      const list = await Promise.all(
        data?.map(async (item) => {
          const option = await this.getNftItemDetail.call(item.tokenId)
          console.log("option", option)
          return {
            // lat: new BigNumber((lat * 1000000).toFixed(0)).toNumber(),
            // lng: new BigNumber((lng * 1000000).toFixed(0)).toNumber(),
            // scaled_latitude: lat,
            // scaled_longitude: lng,
            // osm_id: osmData.data.osm_id,
            // osm_data: osmData.data,
            // claimed: true
          };
        })
      );
      
      return []
    }
  })

  getNftItemDetail = new PromiseState({
    name: "get nft item detail",
    function: async (osmId) => {
     try {
      const nodeRes = await axios.get(`https://nominatim.openstreetmap.org/details?place_id=${osmId}&format=json`)
      console.log("nodeRes", nodeRes)
      if(nodeRes.data) {
        const {centroid: {coordinates}} = nodeRes.data
        const osmData = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coordinates[0]}&lon=${coordinates[1]}`)
        console.log("osmData111", osmData.data)
      }
     } catch (error) {
      console.log("error", error)
     }
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
