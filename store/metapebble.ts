import react from "react"
import axios from "axios";
import moment from 'moment'
import { makeAutoObservable } from 'mobx';
import RootStore from './root';
import getConfig from 'next/config';
import { SiweMessage } from 'siwe';
import { BigNumber } from 'bignumber.js';
import toast from 'react-hot-toast'
import { PromiseState } from "./standard/PromiseState";

const PebbleMultipleLocationNFTABI = [
	{
		"inputs": [
			{
				"internalType": "int256[]",
				"name": "_lats",
				"type": "int256[]"
			},
			{
				"internalType": "int256[]",
				"name": "_longs",
				"type": "int256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_maxDistances",
				"type": "uint256[]"
			},
			{
				"internalType": "address",
				"name": "_verifier",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_symbol",
				"type": "string"
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
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "approved",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Approval",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "ApprovalForAll",
		"type": "event"
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
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
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
			}
		],
		"name": "addPlace",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "approve",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
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
				"internalType": "int256",
				"name": "lat_",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "long_",
				"type": "int256"
			},
			{
				"internalType": "uint256",
				"name": "distance_",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "deviceHash_",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "deviceTimestamp_",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "claim",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "deviceHash_",
				"type": "bytes32"
			}
		],
		"name": "claimedUser",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "getApproved",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			}
		],
		"name": "isApprovedForAll",
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
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "ownerOf",
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
		"name": "palceCount",
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
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "places",
		"outputs": [
			{
				"internalType": "int256",
				"name": "lat",
				"type": "int256"
			},
			{
				"internalType": "int256",
				"name": "long",
				"type": "int256"
			},
			{
				"internalType": "uint256",
				"name": "maxDistance",
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
				"name": "",
				"type": "uint256"
			}
		],
		"name": "placesHash",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
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
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "data",
				"type": "bytes"
			}
		],
		"name": "safeTransferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "operator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "approved",
				"type": "bool"
			}
		],
		"name": "setApprovalForAll",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
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
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "tokenByIndex",
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
				"name": "owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "tokenOfOwnerByIndex",
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
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "tokenURI",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
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
				"name": "from",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenId",
				"type": "uint256"
			}
		],
		"name": "transferFrom",
		"outputs": [],
		"stateMutability": "nonpayable",
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
	}
]

const { publicRuntimeConfig } = getConfig();
const { NEXT_PUBLIC_APIURL } = publicRuntimeConfig;


type DEVICE_ITEM = {
  latitude: number
  longitude: number
  timestamp: number
  distance: number
  signature: string
  devicehash: string
}

export class MpStore {
	rootStore: RootStore;
  contract = {
		PebbleMultipleLocationNFTABI,
		PebbleMultipleLocationNFT: {
			4690: '0xa8b44E4401e8A2c33cC9587b583498A037Bc8F04'
		},
	}

	signStatus: boolean = false
	owner: string = ''
	balance: number = 0
	claimLists: DEVICE_ITEM[] = []
	chainId: number = 4690

	constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

	// set owner address
	setOwnerAddress(address: string) {
		this.owner = address
	}

	setChainId(chainId: number) {
		this.chainId = chainId
	}

	// set sign status
	setSignStauts(status: boolean) {
		this.signStatus = status
	}

	// set balance
	setBalance(balance: number) {
		this.balance = balance
	}

	// set claim lists
	setClaimLists(lists: DEVICE_ITEM[]) {
		this.claimLists = lists
	}

	// create siwe message
	createSiweMessage = (statement: string) => {
    const message = new SiweMessage({
      domain:  typeof window !== 'undefined' && window.location.host ? window.location.host : '',
      address: this.owner,
      statement,
      uri: typeof window !== 'undefined' && window.location.origin ? window.location.origin : '',
      version: '1',
      chainId: this.chainId
    });
    return message.prepareMessage();
  }


	// sign in with metamask
	signInWithMetamask = async(sdk: any) => {
    const message = this.createSiweMessage(`check the location(lat, lng) distance(xxkm) of the user’s(0x…) device from(from ) to(to)` );
    const sign = await sdk?.wallet.sign(message)
    return {message, sign}
  }

	// init loading
	get initLoadinng() {
		return this.getAndFormatPlaces.loading.value || this.getClaimOriginList.loading.value
	}

	// get places from contract and format places
	getAndFormatPlaces = new PromiseState({
		name: 'getAndFormatPlaces',
		function: async(contract: any) => {
			let places = []
			const result = await contract?.call("palceCount");
			const count = result.toNumber()
			for(let i = 0; i < count; i++) {
				const hash = await contract?.call("placesHash", i);
				const item = await contract?.call("places", hash);
				places.push({
					scaled_latitude: new BigNumber(item.lat.toString()).toNumber(),
					scaled_longitude: new BigNumber(item.long.toString()).toNumber(),
					distance: item.maxDistance.toNumber()
				})
			}
			return places
		}
	})

	// get claim origin list
	getClaimOriginList = new PromiseState({
		name: 'getClaimOriginList',
		function: async(message: string, signature: string, places: any, contract: any) => {
			try {
				const response = await axios.post(`${NEXT_PUBLIC_APIURL}/api/get_sign_data_for_location`, {
					signature,
					message, 
					owner: this.owner,
					from: `${moment().startOf('day').unix()}`,
					to: `${moment().endOf('day').unix()}`,
					locations: places
				})    
				console.log('getClaimOriginList', response)
				const result = response.data.result
	
				if(result) {
					this.setSignStauts(true)
					this.getNftClaimedBalance(contract)
				}
				if(result.data.length > 0) {
					this.formatDeviceAddClaimedStatus(result.data, contract)
				}
			} catch (error) {
				console.log('initNft error', error)
				this.setSignStauts(false)
				toast.error('Signature is not valid',)
			}
		}
	})

	// format device add claimed status
	formatDeviceAddClaimedStatus = async (data: any, contract: any) => {
    const list = [...data]
    if(list.length > 0) {
      list.forEach(async (item: DEVICE_ITEM, index) => {
        const status = await contract?.call("claimed", item.devicehash)
        list[index] = {...item, claimed: status, loading: false}
      })
      this.setClaimLists(list)
      console.log('formatDeviceAddClaimedStatus', list)
    }
  }

	// get nft claimed balance
	getNftClaimedBalance = async (contract: any) => {
    const balanceResult = await contract?.call("balanceOf", this.owner);
    this.setBalance(balanceResult.toNumber())
  }

	// claim NFT
	claimNFT = new PromiseState({
		name: 'claimNFT',
		function: async (contract: any, item: any) => {
			try {
			 const { scaled_latitude , scaled_longitude, distance, devicehash, timestamp, signature } = item
			 console.log('item', item)
			 const res = await contract?.call("claim", scaled_latitude , scaled_longitude, distance, devicehash, timestamp, signature)
			 console.log('claimNFT res', res);
	 
			 if(res.receipt) {
				 toast.success(res.receipt.blockHash)
				 this.getNftClaimedBalance(contract)
			 }
			} catch (err) {
			 console.log('claimNFT err', err)
			 toast.error( 'Claim failed')
			}
		 }
	})
}