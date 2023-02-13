# MetaPebble nft demo

## Local Development

The following assumes the use of `node@>=16`.

### Install Dependencies

`pnpm install`

### Run

`pnpm dev`

### How to query metapeeble api

metapebble api: https://test.metapebble.app/swagger/index.html#/metapebble/mutation.get_sign_data_for_location

#### Use GeostreamSDK sign and get prof data for location, get claim origin list
```ts
const query = gql`{
  MetapebbleVerifiedDrop(calls:[{address: "${contract.address}", chainId: 4690}]) {
      lat
      long
      startTimestamp
      endTimestamp
      maxDistance
    }
  }
`
const places = await request('https://smartgraph.one/metapebble_demo/graphql', query)
// format places
// return [
//   {
//       from: 1676879793,
//       to: 1676015793,
//       scaled_latitude: 30400000,
//       scaled_longitude: 120520000,
//       distance: 1000,
//       imei: "12131313" // just mock
//   }
// ]

// mock
const proof = await sdk.pol.getProofMock({
  owner: '0x....',
  locations: places,
});

// mainnet
const proof = await sdk.pol.getProof({
  owner: '0x....',
  locations: places, // delete places item imei
});

// response:
// [
//     {
//       "scaled_latitude": string,
//       "scaled_longitude": string,
//       "from": number,
//       "to": number,
//       "distance": number,
//       "signature": "string",
//       "devicehash": "string",
//     }
//   ]
```

###  claim token
```ts
const item = response[0];
const { distance, devicehash, signature } = item;
await axios.post("/api/mint", {
  signature,
  holder: this.owner,
  deviceHash: devicehash,
  distance: distance
});
```

#### interact with nft contract
```ts
const item = response[0];
const { scaled_latitude, scaled_longitude, distance, devicehash, timestamp, signature } = item;
const { contract } = useContract(contractAddress, contractAbi);

// get claim fee
const fee = await contract?.call("claimFee");

// get claimed balance
const balanceResult = await contract?.call("balanceOf", this.owner);

// check token claimeable
const status = await contract?.call("claimed", item.devicehash);

// claim token
await contract?.call("claim", scaled_latitude, scaled_longitude, distance, devicehash, timestamp, signature, {
  value: this.claimFee.value
});
```
