import { contracts } from "config/chain";
import request, { gql } from "graphql-request";
import { SmartSigner } from "../chain";
const api_url = "https://smartgraph.one/metapebble_demo/graphql";
export class CesToken {
  signer: SmartSigner;
  constructor({ signer }: { signer: SmartSigner }) {
    this.signer = signer;
  }
  get chainId () {
    return this.signer.chainId
  }
  get address () {
    return contracts.CesToken[this.chainId].address
  }
  async mint({
    deviceHash,
    distance,
    holder,
    signature
  }) {
    const query = gql`
      query {
        CesToken(calls: { address: ${this.address}, chainId: ${this.chainId} }) {
          claim(deviceHash: ${deviceHash}, distance: ${distance}, holder: ${holder}, signature: ${signature})
        }
      }
    `;
    const data = await request(api_url, query);
    this.signer.sendTransaction({
      data,
      address: "0x5F20fB1baA05c4E9975EF26eb73778557bB26ED7",
    });
  }
}
