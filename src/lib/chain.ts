import { rpcs } from "config/chain";
import { ethers } from "ethers";
import { Deferrable } from "ethers/lib/utils";
import _ from "lodash";

export class SmartSigner {
  signer: ethers.Signer;
  chainId: number
  constructor({ chainId }: { chainId: number }) {
    this.chainId = chainId
    this.init({
      chainId
    })
  }

  async init({ chainId }: { chainId: number }) {
    const provider = new ethers.providers.JsonRpcProvider(rpcs[chainId]);
    const signer = new ethers.Wallet(process.env.PEBBLE_TOKEN_PRIVATE!, provider);
    this.signer = signer
  }
  async sendTransaction({ data, address, value, gasPrice }: { data: string; address: string; value?: string; gasPrice?: string }) {
    const sendTransactionParam: Deferrable<ethers.providers.TransactionRequest> = _.omitBy(
      { to: address, data, value: value ? ethers.BigNumber.from(value) : null, gasPrice: gasPrice ? ethers.BigNumber.from(gasPrice) : null },
      _.isNil
    );
    const res = await this.signer.sendTransaction(sendTransactionParam);
    return res.wait();
  }
}
