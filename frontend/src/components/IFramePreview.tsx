/**
 * Accepts data url or just a url
 */
export function IFramePreview({ src }: { src: string }) {
  return (
    <iframe
      width="100%"
      title="file preview"
      className="db ba"
      style={{ height: "20vh" }}
      src={src}
    />
  );
}
