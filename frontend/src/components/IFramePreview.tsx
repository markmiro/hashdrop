/**
 * Accepts data url or just a url
 */
export function IFramePreview({
  src,
  style,
}: {
  src: string;
  style?: React.CSSProperties;
}) {
  return (
    <iframe
      width="100%"
      title="file preview"
      style={{ height: "20vh", border: "none", display: "block", ...style }}
      src={src}
    />
  );
}
