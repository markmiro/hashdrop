import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "GET") {
    res.status(405).json({
      error: { message: "Only 'GET' method is supported." },
    });
    return;
  }

  try {
    const ipfsRes = await axios.get(
      `https://hashdrop.mypinata.cloud/ipfs/${req.query.cid as string}`
    );

    // const cid = await pinFile(file, pinataMetadata);
    res.status(200).json({ data: ipfsRes.data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ data: null, error: err });
  }
};
