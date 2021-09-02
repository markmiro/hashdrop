import { format } from "date-fns";

export function formatDate(date: Date) {
  return format(date, "yyyy-MM-dd-HH_mm_ss");
}

export function DownloadButton({ cid, text }: { cid?: string; text: string }) {
  return (
    <a
      className={`btn-light text-black flex-shrink-0 no-underline ${
        !text && "opacity-40 pointer-events-none"
      }`}
      download={`${cid ?? "hashdrop-" + formatDate(new Date())}.txt`}
      href={"data:text/plain," + encodeURIComponent(text)}
    >
      ⇣ Download
    </a>
  );
}
