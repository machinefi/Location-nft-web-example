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

export class nftStore {
  rootStore: RootStore;
  defaultChainId: 4690
  data = nftData

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

  setData(args: Partial<nftStore>) {
    Object.assign(this, args);
  }

  // Main function
  async init({ address, chainId,  sdk, disconnect, name }: any) {
    if (name == "map" && !this.mapPlaces.value) {
      disconnect()
      return
    }
    this.setData({
      siteName: name, sdk, owner:address, chainId, disconnect, loading: true,
      contractInstance: this.data.contract[name], 
    });
    // @ts-ignore
    this.geoStreamSdk = new GeostreamSDK({mode: chainId === 4689 ? 'prod' : 'dev', signer: {signMessage: (data) => this.sdk.wallet.sign(data), getAddress: () => address}});
    
    if(name !== 'map') {
      await this.places.call();
      await this.nftBalance.call();
      await this.claimFee.call();
      await this.signAndGetProf.call();
    }
    await this.claimLists.call();
  }

  // init loading
  get initLoadinng() {
    if(this.siteName === 'map') return this.mapPlaces.loading.value || this.signAndGetProf.loading.value;
    return  this.places.loading.value || this.signAndGetProf.loading.value;
  }

  // nft balance
  nftBalance = new PromiseState({
    name: "get nft balance",
    value: 0,
    function: async () => {
      let data = await this.smartQueryFun.call(`balanceOf(owner: "${this.owner}")`, 'LocationNFT')
      return new BigNumber(data?.balanceOf).toNumber()
    },
  });

  claimFee = new PromiseState({
    name: "get claim fee",
    value: 0,
    function: async () => {
      let data = await this.smartQueryFun.call(`claimFee`, 'LocationNFT')
      return new BigNumber(data?.claimFee).toNumber()
    },
  });

  // place count
  placeCount = new PromiseState({
    name: "get place count",
    function: async () => {
      let data = await this.smartQueryFun.call(`palceCount`, 'LocationNFT')
      return Number(data?.palceCount)
    },
  });

  // place hash
  placeHash = new PromiseState({
    name: "place hash",
    function: async (index) => {
      console.log('index', index)
      let data = await this.smartQueryFun.call(`placesHash(args0: "${index}")`, 'LocationNFT')
      return data?.placesHash
    },
  });

  // place item
  placeItem = new PromiseState({
    name: "place item",
    function: async () => {
      let data = await this.smartQueryFun.call(`places(args0: "${this.placeHash.value}")`, 'LocationNFT')
      return data?.places
    },
  });

  // get places from contract and format places
  places = new PromiseState({
    name: "get query places from contract",
    function: async () => {
      await this.placeCount.call();
      console.log('placeCount', this.placeCount.value)
      let places = await Promise.all(
        _.range(0, this.placeCount.value).map(async (i) => {
          await this.placeHash.call(i.toString());
          await this.placeItem.call();
          const [lat, long, maxDistance, startTimestamp , endTimestamp] = this.placeItem.value.split(',');
          console.log('placeItem', lat, long, maxDistance, startTimestamp, endTimestamp)
          return {
            from: startTimestamp,
            to: endTimestamp,
            scaled_latitude: new BigNumber(lat).toNumber(),
            scaled_longitude: new BigNumber(long).toNumber(),
            distance: maxDistance,
            feature: `from ${startTimestamp} to ${endTimestamp} within ${maxDistance} meter from [${new BigNumber(lat).div(1e6).toNumber()}, ${new BigNumber(long).div(1e6).toNumber()}]`
          };
        })
      );
      return places;
    },
  });

  // click map set location
  mapPlaces = new PromiseState({
    name: "map places",
    function: async (location) => {
      const {lat, lng} = location
      return [{
        from: 1670402620,
        to: 1670403620,
        scaled_latitude: new BigNumber((lat * 1000000).toFixed(0)).toNumber(),
        scaled_longitude: new BigNumber((lng * 1000000).toFixed(0)).toNumber(),
        distance: 100,
      }]
    }
  })

  // sign and getProf
  signAndGetProf = new PromiseState({
    name: "get sign data from Metapebble API",
    value: [] as SIGN_DATA[],
    function: async () => {
      try {
        const placesArr = this.siteName === 'map' ? this.mapPlaces.value : this.places.value
        const places = this.chainId === 4690 ? placesArr.map(o => ({...o, imei:`1938473${Math.floor(Math.random() * 1000)}`})) : placesArr

        let data = { locations: places}
        const result = this.chainId === 4690 ? await this.geoStreamSdk.pol.getMockProof(data) : await this.geoStreamSdk.pol.getProof(data);
        console.log('result', result)
        const signData: SIGN_DATA[] = result
        this.setData({ signStatus: true, loading: false });

        return signData;
      } catch (error: any) {
        console.error('error', error)
        const err = error.response.data.error.message
        toast.error(`${err}`);
        this.disconnect();
        this.setData({ signStatus: false, loading: false });
        return [];
      }
    },
  });

  // format claim Lists
  claimLists = new PromiseState({
    name: "check claim list from contract",
    value: [] as DEVICE_ITEM[],
    function: async () => {
      if (!this.signAndGetProf.value) return [];
      const list = await Promise.all(
        this.signAndGetProf.value?.map(async (item) => {
          await this.claimedStatus.call(item.devicehash)
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

  // get device claimed status
  claimedStatus = new PromiseState({
    name: "check claimed status",
    value: false,
    function: async (devicehash: string) => {
      const query = gql`{
        LocationNFT(calls:[{address: "${this.contractInstance[this.chainId].address}",chainId: ${this.chainId}}]) {
            claimed(deviceHash_: "${devicehash}")
          }
        }
      `
      let data = await request('https://smartgraph.one/metapebble_demo/graphql', query)
      return data.LocationNFT[0].claimed
    }
  })

  // mint Osm NFT
  mintOsmNFT = new PromiseState({
    name: "mint Osm NFT",
    function: async (item: SIGN_DATA, index: number) => {
      this.setData({claimIndex: index})
      try {
       const osmData = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${new BigNumber(item.scaled_latitude).div(1e6).toNumber()}&lon=${new BigNumber(item.scaled_longitude).div(1e6).toNumber()}`)
        console.log('osmData', osmData)
       if(osmData) {
        const { osm_id } = osmData.data  
        const status = await this.smartQueryFun.call(`mint(account: "${this.owner}", id: "${osm_id}")`, 'OpenStreetMapNFT')
        const res = await this.smartQueryFun.call(`mint(account: "${this.owner}", id: "${osm_id}")`, 'OpenStreetMapNFT')
        console.log('res', res)
      }
      } catch (err) {
        console.log("error", err);
        toast.error("Claim failed");
      }
    },
  });

  // claim NFT
  claimNFT = new PromiseState({
    name: "claim NFT",
    function: async (item: SIGN_DATA, index: number) => {
      this.setData({claimIndex: index})
      try {
        const { scaled_latitude, scaled_longitude, distance, devicehash, from, to, signature } = item;
        const res = await this.smartQueryFun.call(`claim(
          deviceHash_: "${devicehash}",
          distance_: "${distance}",
          endTimestamp_: "${to}",
          lat_: "${scaled_latitude}",
          long_: "${scaled_longitude}",
          signature: "${signature}",
          startTimestamp_: "${from}",
        )`, 'LocationNFT', {
          value: this.claimFee.value
        })
        console.log('res', res)
        if (res.claim) {
          console.log("Receipt", res.claim);
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

  smartQueryFun = new PromiseState({
    name: "smart query",
    function: async (eventName, name, value?) => {
      const query = gql`{
        LocationNFT(calls:[{address: "${this.contractInstance[this.chainId].address}",chainId: ${this.chainId}}]) {
            ${eventName}
          }
        }
      `
      let data = await request('https://smartgraph.one/metapebble_demo/graphql', query, value)
      return data[name][0]
    }
  })
}
