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
      this.isBalanceEnough.call()
      this.nftBalanceList.call()
    }
  }

  // init loading
  get initLoadinng() {
    return  this.mapPlaces.loading.value
  }

  // Is the balance sufficient 
  isBalanceEnough = new PromiseState({
    name: "is balance enough",
    function: async () => {
      const wallet = await this.sdk.wallet.balance()
      const status = Number(wallet.displayValue) > 0
      if(!status) toast('Insufficient balance')
      return status
    }
  })

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
        scaled_latitude: lat.toFixed(4),
        scaled_longitude: lng.toFixed(4),
        osm_id: osmData.data.osm_id,
        osm_data: osmData.data,
        claimed: nftBalance.toNumber() > 0
      }
      console.log("osmData", osmData.data, nftBalance.toNumber())
      if(isClaimed) {
        this.setData({tabIndex: 0})
        const list = this.nftBalanceList.value || []
        list.push(place)
        this.nftBalanceList.setValue(list)
      }
      return [place]
    }
  })

  // get nft balance
  nftBalanceList = new PromiseState({
    name: "nft balance list",
    value: [] as any[],
    function: async () => {
      const { data } = await axios.get(`https://nft.iopay.me/account/4690/own/${this.owner.toLowerCase()}?skip=0&first=1000&type=1155`)
      if(data.length === 0) return []
      const list = await Promise.all(
        data?.map(async (item) => {
          const option = await this.getNftItemDetail.call(item.tokenId)
          return {...option};
        })
      );
      
      return list
    }
  })

  // use node_id query osm data
  getNftItemDetail = new PromiseState({
    name: "get nft item detail",
    function: async (osmId) => {
     try {
      const nodeRes = await axios.get(`https://nominatim.openstreetmap.org/details?osmtype=W&osmid=${osmId}&addressdetails=1&hierarchy=0&group_hierarchy=1&polygon_geojson=1&format=json`)
      if(nodeRes.data) {
        const {centroid: {coordinates}} = nodeRes.data
        const [lng, lat] = coordinates
        const osmData = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        return {
          lat: new BigNumber((lng * 1000000).toFixed(0)).toNumber(),
          lng: new BigNumber((lat * 1000000).toFixed(0)).toNumber(),
          scaled_latitude: lng.toFixed(4),
          scaled_longitude: lat.toFixed(4),
          osm_id: osmData.data.osm_id,
          osm_data: osmData.data,
          claimed: true
        }
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
