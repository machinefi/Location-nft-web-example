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

#### create swie sign message

https://docs.login.xyz/libraries/typescript

```ts
import { SiweMessage } from "siwe";

const createSiweMessage = (address: string, statement: string) => {
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId,
  });
  return message.prepareMessage();
};
```

#### sign the query then send to metapebble server to get sign data for location

```ts
const message = createSiweMessage(address || "", "Sign in Location Based NFT");
const sign = await sdk?.wallet.sign(message);

const response = await axios.post(
  `https://test.metapebble.app/api/get_sign_data_for_location`,
  { signature, message, owner: address }
);

// response:
// [
//     {
//       "latitude": string,
//       "longitude": string,
//       "timestamp": number,
//       "distance": number,
//       "signature": "string",
//       "devicehash": "string",
//       "imei": "string"
//     }
//   ]
```

#### interact with contract

```ts
const item = response[0];
const { latitude, longitude, distance, devicehash, timestamp, signature } = item
const { contract } = useContract(contractAddress, contractAbi);

// check token claimeable
const status = await contract?.call("claimed", item.devicehash);

// claim token

await contract?.call(
  "claim",
  latitude,
  longitude,
  distance,
  devicehash,
  timestamp,
  signature
);
```
