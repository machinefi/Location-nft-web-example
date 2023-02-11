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
  async claimed({
    deviceHash
  }) {
    const query = gql`
      query {
        MetapebbleVerifiedDrop(calls: [{ address: "${this.address}", chainId: ${this.chainId} }]) {
          claimed(deviceHash_: "${deviceHash}")
        }
      }
    `;
    const { MetapebbleVerifiedDrop: [ { claimed } ] } = await request(api_url, query);
    return claimed === 'true'
  }
  async mint({
    deviceHash,
    distance,
    holder,
    signature
  }) {
    const query = gql`
      query {
        MetapebbleVerifiedDrop(calls: [{ address: "${this.address}", chainId: ${this.chainId} }]) {
          claim(deviceHash: "${deviceHash}", distance: "${distance}", holder: "${holder}", signature: "${signature}")
        }
      }
    `;
    const {MetapebbleVerifiedDrop: [{claim}]} = await request(api_url, query);
    return this.signer.sendTransaction({
      data: claim,
      address: this.address,
    });
  }
}
