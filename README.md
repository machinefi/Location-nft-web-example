MetaPebble nft demo
=========================

## Local Development

The following assumes the use of `node@>=16`.

### Install Dependencies

`pnpm install`

### Run

`pnpm dev`

### How to query metapeeble api

metapebble api: https://test.metapebble.app/swagger/index.html#/metapebble/mutation.get_sign_data_for_location


### loading public data
```ts
  const loadPublicData = async() => {
    const places = await mpStore.getAndFormatPlaces.call(contract)
    const { message, sign } = await mpStore.signInWithMetamask(sdk)
    await mpStore.getClaimOriginList.call(message, sign, places, contract)
  }
```

#### create swie sign message

https://docs.login.xyz/libraries/typescript

```ts
import { SiweMessage } from "siwe";

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
```

#### get places from contract and format places
```ts
  getAndFormatPlaces = async(contract: any) => {
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
```
#### sign the query then send to metapebble server to get sign data for location, get claim origin list

```ts
const message = this.createSiweMessage(`Sign in Location Based NFT` );
const sign = await sdk?.wallet.sign(message)

const response = await axios.post(`${NEXT_PUBLIC_APIURL}/api/get_sign_data_for_location`, 
  {
    signature,
    message, 
    owner: this.owner,
    from: `${moment().startOf('day').unix()}`,
    to: `${moment().endOf('day').unix()}`,
    locations: places
  })    
// response:
// [
//     {
//       "scaled_latitude": string,
//       "scaled_longitude": string,
//       "timestamp": number,
//       "distance": number,
//       "signature": "string",
//       "devicehash": "string",
//     }
//   ]
```

#### interact with contract

```ts
const item = response[0];
const { scaled_latitude , scaled_longitude, distance, devicehash, timestamp, signature } = item
const { contract } = useContract(contractAddress, contractAbi);

// get claimed balance
const balanceResult = await contract?.call("balanceOf", this.owner);

// check token claimeable
const status = await contract?.call("claimed", item.devicehash)

// claim token
await contract?.call(
  "claim",
  scaled_latitude,
  scaled_longitude,
  distance,
  devicehash,
  timestamp,
  signature
);
```

