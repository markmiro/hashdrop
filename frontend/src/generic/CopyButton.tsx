import copy from "copy-to-clipboard";
import React, { useCallback, useState } from "react";

export function CopyButton({
  toCopy,
  className,
}: {
  toCopy: string;
  className?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(() => {
    setIsCopied(true);
    copy(toCopy);
  }, [toCopy]);

  const handleCopied = useCallback(() => {
    setIsCopied(false);
  }, []);

  return (
    <button
      title={toCopy}
      onClick={handleCopy}
      onMouseLeave={handleCopied}
      className={className}
    >
      {isCopied ? "Copied" : "Copy"}
    </button>
  );
}
