const Hash = require("ipfs-only-hash");

async function fileToUint8Array(fob: File | Blob) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onloadend = (e) => {
        if (e.target?.readyState === FileReader.DONE) {
          const arrayBuffer = e.target.result as ArrayBuffer; // `as` because using `readAsArrayBuffer()`
          const array = new Uint8Array(arrayBuffer);
          resolve(array);
        }
      };
      reader.readAsArrayBuffer(fob);
    } catch (err) {
      reject(err);
    }
  });
}

export async function ipfsCid(fob: File | Blob): Promise<string> {
  // options: https://github.com/ipfs-inactive/js-ipfs-unixfs-importer#api
  const byteArr = await fileToUint8Array(fob);
  const cid = await Hash.of(byteArr, {
    cidVersion: 1,
    rawLeaves: true,
  });
  return cid;
}
