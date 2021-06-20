import React from "react";

export function VStack({
  space = 1,
  children,
}: {
  space: number;
  children: React.ReactNode;
}) {
  const arr = React.Children.toArray(children)
    .filter((c) => c)
    .map((child, i) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          className:
            child.props.className +
            ` item-${i} ` +
            (i === 0 ? "" : ` mt${space}`),
        });
      }
      return child;
    });

  return <>{arr}</>;
}
