// https://stackoverflow.com/a/20285053
// Also, this: `window.URL.createObjectURL()`
// https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
export function fileOrBlobAsDataUrl(fileOrBlob: File | Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}
