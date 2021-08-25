export function fileOrBlobAsText(fileOrBlob: File | Blob) {
  return new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const contents = e.target?.result as string;
        // console.log(contents);
        resolve(contents);
      };
      reader.readAsText(fileOrBlob);
    } catch (err) {
      reject(err);
    }
  });
}
