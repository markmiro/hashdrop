import { format } from "date-fns";

export function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd-HH_mm_ss");
}

export function DownloadButton({ cid, text }: { cid?: string; text: string }) {
  return (
    <a
      className={`dib ba br2 ph2 no-underline bg-washed-yellow black flex-shrink-0 ${
        !text && "o-40"
      }`}
      style={{ pointerEvents: text ? "all" : "none" }}
      download={`${cid ?? "hashdrop-" + formatDate(new Date())}.txt`}
      href={"data:text/plain," + encodeURIComponent(text)}
    >
      ⇣ Download
    </a>
  );
}
