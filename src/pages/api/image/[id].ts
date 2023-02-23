import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { id } = req.query;
  const filePath = path.join(process.cwd(), "public", "images", `${id}.png`);
  const file = fs.readFileSync(filePath);
  res.setHeader("Content-Type", "image/jpeg");
  res.send(file);
}
