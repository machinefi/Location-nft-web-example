import { SmartSigner } from "@/lib/chain";
import { CesToken } from "@/lib/contract/cesToken";
import { NextApiRequest, NextApiResponse } from "next/types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { deviceHash,distance, signature, holder }: {
    deviceHash: string
    distance: number | string
    signature: string
    holder: string
  } = req.body;
  try {
    const signer = new SmartSigner({ chainId: 4690 });
    const cesToken = new CesToken({ signer });
    const claimed = await cesToken.claimed({
      deviceHash: deviceHash,
      
    })
    console.dir(res)
    if (claimed) {
       res.status(400).json({ code: "BAD REQUEST", message: "already claimed" });
       return
    }
    await cesToken.mint({
      deviceHash: deviceHash,
      distance: String(distance),
      holder,
      signature: signature,
    });
    res.status(200).json({ code: "OK", message: "success" });
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ code: "INTERNAL SERVER ERROR", message: error.message });
  }
}
