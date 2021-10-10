import delay from "delay";
import { PinMetadata } from "./../src/types.d";
import { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import FormData from "form-data";
import formidable, { File } from "formidable";
import fs from "fs";

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== "POST") {
    res.status(405).json({
      error: { message: "Only 'POST' method is supported." },
    });
    return;
  }

  const form = new formidable.IncomingForm({
    multiples: false,
    keepExtensions: true,
  });

  const { file, pinataMetadata } = await new Promise<{
    file: File;
    pinataMetadata?: PinMetadata;
  }>((resolve) => {
    form.parse(req, async (err, fields, files) => {
      const file = files.file as File;
      let pinataMetadata;
      if (fields.pinataMetadata) {
        pinataMetadata = JSON.parse(
          fields.pinataMetadata as string
        ) as PinMetadata;
      }
      resolve({
        file,
        pinataMetadata,
      });
    });
  });

  try {
    const cid = await pinFile(file, pinataMetadata);
    res.status(200).json({ cid, pinataMetadata });
  } catch (err) {
    console.log(err);
    res.status(500).json({ cid: "" });
  }
};

async function pinFile(file: File, pinataMetadata?: PinMetadata) {
  // We gather a local file for this example, but any valid readStream source will work here.
  let data = new FormData();
  // https://github.com/form-data/form-data/issues/220
  try {
    // https://github.com/form-data/form-data/issues/359
    data.append("file", fs.createReadStream(file.path));
  } catch (err) {
    console.log(err);
  }

  // You'll need to make sure that the metadata is in the form of a JSON object that's been converted to a string
  // metadata is optional
  if (pinataMetadata) {
    const metadata = JSON.stringify(pinataMetadata);
    data.append("pinataMetadata", metadata);
  }

  // pinataOptions are optional
  const pinataOptions = JSON.stringify({
    cidVersion: 1,
  });
  data.append("pinataOptions", pinataOptions);

  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      data,
      {
        maxBodyLength: Infinity, //this is needed to prevent axios from erroring out with large files
        headers: {
          "Content-Type": `multipart/form-data; boundary=${data.getBoundary()}`,
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_API_SECRET,
        },
      }
    );

    await delay(1000);

    await axios.get(
      `https://hashdrop.mypinata.cloud/ipfs/${response.data.IpfsHash}`
    );
    console.log(`Got CID: ${response.data.IpfsHash}`);
    return response.data.IpfsHash;
  } catch (err) {
    console.error(err);
  }
}
