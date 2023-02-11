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

export class nftStore {
  rootStore: RootStore;
  data = {
    "bgColor": "linear-gradient(0deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), linear-gradient(107.56deg, #00C2FF 0%, #CC00FF 100%)",
    "type": "nft",
    "ui": {
      "logos": [
        "http://localhost:3000/images/logo.png",
        "http://localhost:3000/images/logo_CES.png"
      ],
      "title": "Claim Your CES- \n W3bstream NFT",
      "subtitle": "Simply download ioPay wallet and connect your location to claim the NFT!",
      "tips": {
        "name": "View claim instructions >>>",
        "url": "https://docs.google.com/document/d/1kchVOHNmRUy5JfqLfeprCufgNmxnJlcj8M3_cnFrXyo/edit"
      },
      "steps": [
        {
          "title": "Step 1",
          "description": "Download ioPay wallet",
          "image": "http://localhost:3000/images/step1.png",
          "href": "https://iopay.me/"
        },
        {
          "title": "Step 2",
          "description": "Enable W3bstream in ioPay Bind Geo Location to Wallet",
          "image": "http://localhost:3000/images/step2.png",
          "href": null
        },
        {
          "title": "Step 3",
          "description": "Claim NFT",
          "image": "http://localhost:3000/images/step3.png",
          "href": null
        }
      ],
      "icon": {
        "image": "http://localhost:3000/images/badge.png",
        "bg": "http://localhost:3000/images/bg_nft_pic.png"
      }
    },
    "contract":{
      "4690": {
        "abi": [
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
                "internalType": "uint256[]",
                "name": "_startTimestamps",
                "type": "uint256[]"
              },
              {
                "internalType": "uint256[]",
                "name": "_endTimestamps",
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
                "name": "startTimestamp_",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "endTimestamp_",
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
              },
              {
                "internalType": "uint256",
                "name": "startTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "endTimestamp",
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
        ],
        "address": "0x775B56a6E3b13A19404FC186098f564B19715Ab9",
        "API_URL":"https://geo-test.w3bstream.com"
      },
      "4689": {
        "abi": [
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
                "internalType": "uint256[]",
                "name": "_startTimestamps",
                "type": "uint256[]"
              },
              {
                "internalType": "uint256[]",
                "name": "_endTimestamps",
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
                "name": "startTimestamp_",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "endTimestamp_",
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
              },
              {
                "internalType": "uint256",
                "name": "startTimestamp",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "endTimestamp",
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
        ],
        "address": "0xbe050178c28885a0204fcfaC2A1039C34164f466",
        "API_URL":"https://geo.w3bstream.com"
      }
    }
  }

  config = {
    testnet: {
      chainId: 4690,
      blockExplorerUrls: ['https://testnet.iotexscan.io'],
      chainName: 'IOTX Testnet',
      nativeCurrency: {
        decimals:  18,
        name: 'IOTX Testnet',
        symbol: 'IOTX'
      },
      rpcUrls: ['https://babel-api.testnet.iotex.io/']
    },
    mainnet: {
      chainId: 4689,
      blockExplorerUrls: ['https://iotexscan.io'],
      chainName: 'IoTeX',
      nativeCurrency: {
        decimals:  18,
        name: 'IOTX Mainnet',
        symbol: 'IOTX'
      },
      rpcUrls: ['https://babel-api.mainnet.iotex.io/']
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

  setData(args: Partial<nftStore>) {
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
    console.log('something', this.places.value, this.nftBalance.value, this.claimFee.value)
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
        const response = await axios.post(`${this.data.contract[this.chainId].API_URL}/api/pol`, {
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
