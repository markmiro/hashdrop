export function textToBlob(text: string) {
  return new Blob([text], { type: "text/plain" });
}
