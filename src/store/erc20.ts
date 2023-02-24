import axios from "axios";
import { makeAutoObservable } from "mobx";
import RootStore from "./root";
import { BigNumber } from "bignumber.js";
import toast from "react-hot-toast";
import { PromiseState } from "./standard/PromiseState";
import _ from "lodash";
import { request, gql } from 'graphql-request'
import { erc20Data } from '../config/chain'
import {GeostreamSDK} from '@w3bstream/geostream'

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
  defaultChainId= 4689
  data = erc20Data


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

  setData(args: Partial<erc20Store>) {
    Object.assign(this, args);
  }

  // Main function
  async init({ address, chainId,  sdk, disconnect, name }: any) {
    this.setData({
      siteName: name, sdk, owner:address, chainId, disconnect, loading: true,
      contractInstance: this.data.contract[name], 
    });
    if (name == "map" && !this.mapPlaces.value) {
      disconnect()
      return
    }
    // @ts-ignore
    this.geoStreamSdk = new GeostreamSDK({mode: chainId === 4689 ? 'prod' : 'dev', signer: {signMessage: (data) => this.sdk.wallet.sign(data), getAddress: () => address}});
    console.log('geoStreamSdk', this.geoStreamSdk)
    
    if(name !== 'map') await this.places.call();
    await this.signAndGetProf.call();
    await this.claimLists.call();
  }

  // init loading
  get initLoadinng() {
    if(this.siteName === 'map') return this.mapPlaces.loading.value || this.signAndGetProf.loading.value;
    return  this.places.loading.value || this.signAndGetProf.loading.value;
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
      const data = await request('https://smartgraph.one/metapebble_demo/graphql', query)
      if(data) {
        const places = data.MetapebbleVerifiedDrop.map((item) => {
          return {
              from: Number(item.startTimestamp),
              to: Number(item.endTimestamp),
              scaled_latitude: new BigNumber(item.lat.toString()).toNumber(),
              scaled_longitude: new BigNumber(item.long.toString()).toNumber(),
              distance: Number(item.maxDistance),
            }
        })
        return places
      }
    }
  })

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
        MetapebbleVerifiedDrop(calls:[{address: "${this.contractInstance[this.chainId].address}",chainId: ${this.chainId}}]) {
            claimed(deviceHash_: "${devicehash}")
          }
        }
      `
      let data = await request('https://smartgraph.one/metapebble_demo/graphql', query)
      return data.MetapebbleVerifiedDrop[0].claimed
    }
  })

  mintOsmNFT = new PromiseState({})

  // claim token
  claimNFT = new PromiseState({
    name: "claim token",
    function: async (item: SIGN_DATA, index: number) => {
      this.setData({claimIndex: index})
      try {
        const { distance, devicehash, signature } = item;
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
