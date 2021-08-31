// https://stackoverflow.com/a/20285053
export function fobAsText(fob: File | Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(fob);
  });
}
