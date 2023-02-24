import { NextApiRequest, NextApiResponse } from "next/types";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const NextRequestMeta = Reflect.ownKeys(req).find((s) => String(s) === "Symbol(NextRequestMeta)");
  const _protocol = req[NextRequestMeta || ""]?._protocol || "https";
  const baseURI = `${_protocol}://${req.headers.host}`;
  const tokenURLMetaData = {
    description: "nft description",
    image: `${baseURI}/api/image/${id}`,
    name: `Location NFT`,
  };
  try {
    const filePath = path.join(process.cwd(), "var", "image", `${id}.png`);
    if (fs.existsSync(filePath)) {
      return res.status(200).json(tokenURLMetaData);
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(`https://www.openstreetmap.org/way/${id}`);
    await page.waitForSelector("#map");
    const mapElement = await page.$("#map");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const boundingBox = await mapElement?.boundingBox();
    let screenshot: any;
    if (boundingBox) {
      screenshot = await page.screenshot({
        clip: {
          x: boundingBox.x,
          y: boundingBox.y,
          width: boundingBox.width - 40,
          height: boundingBox.height - 40,
        },
      });
    }
    fs.writeFileSync(filePath, screenshot);
    await browser.close();
    res.status(200).json(tokenURLMetaData);
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ code: "INTERNAL SERVER ERROR", message: error.message });
  }
}
