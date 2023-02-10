import { SmartSigner } from "@/lib/chain";
import { CesToken } from "@/lib/contract/cesToken";
import { getSignDataForLocation } from "@/lib/service/ces";
import { NextApiRequest, NextApiResponse } from "next/types";
import { SiweMessage } from "siwe";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { message, signature, owner, locations } = req.body;
  try {
    const siweMessage = new SiweMessage(message);
    await siweMessage.validate(signature);
  } catch (error) {
    res.status(400).json({
      code: "BAD_REQUEST",
      message: "Invalid Singature: " + error.message,
    });
    return;
  }
  try {
    const signedDatas = await getSignDataForLocation({
      owner,
      // @ts-ignore
      locations,
    });
    if (signedDatas?.length) {
      const signer = new SmartSigner({ chainId: 4690 });
      const cesToken = new CesToken({ signer });
      await Promise.all(
        signedDatas.map(async (signData) => {
          return cesToken.mint({
            deviceHash: signData.deviceHash,
            distance: String(signData.distance),
            holder: owner,
            signature: signData.signature,
          });
        })
      );
      return true
    }
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ code: "INTERNAL SERVER ERROR", message: error.message });
  }
}
