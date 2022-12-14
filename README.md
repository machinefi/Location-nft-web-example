# MetaPebble nft demo

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

```js
import { SiweMessage } from "siwe";

const createSiweMessage = () => {
  const message = new SiweMessage({
    domain: globalThis.location.host,
    address: "0x.....",
    statement: "Sign in Location Based NFT",
    uri: globalThis.location.host,
    version: "1",
    chainId: 4690,
  });
  return message.prepareMessage();
};
```

#### sign the query then send to metapebble server to get sign data for location, get claim origin list

```ts
const message = createSiweMessage();
const signature = await sdk?.wallet.sign(message);

const response = await axios.post(`${NEXT_PUBLIC_APIURL}/api/get_sign_data_for_location`, {
  signature,
  message,
  owner: "0x...",
  from: `${moment().startOf("day").unix()}`,
  to: `${moment().endOf("day").unix()}`,
  locations: [
    {
      scaled_latitude: 4131637,
      scaled_longitude: 10168213,
      distance: 1000,
    },
  ],
});
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
