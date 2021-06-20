import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "DELETE") {
    res.status(405).json({
      error: { message: "Only 'DELETE' method is supported." },
    });
    return;
  }

  const response = await unpin(req.query.cid as string);
  res.status(response.status).send({ data: response.data });
};

// ---------------------------------------------

const unpin = async (hashToUnpin: string) => {
  const url = `https://api.pinata.cloud/pinning/unpin/${hashToUnpin}`;

  return await axios.delete(url, {
    headers: {
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
    },
  });
};
