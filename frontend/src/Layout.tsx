import React from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Global styles
    <div className="code pv4 ph2 lh-copy">
      {/* Container */}
      <div className="ml-auto mr-auto" style={{ maxWidth: "72ch" }}>
        {/* Layout */}
        <div className="flex flex-column items-stretch">{children}</div>
      </div>
    </div>
  );
}
