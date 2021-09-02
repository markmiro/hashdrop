import React, { ReactElement } from "react";

type TabProps<T extends string> = {
  value: T;
  label: string;
  children: React.ReactNode;
};

function TabButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={
        isActive
          ? "font-medium cursor-default  px-2 mr-1 bg-white border-t border-l border-r  border-black"
          : "font-medium cursor-default px-2 mr-1 bg-black border-t border-l border-r bg-opacity-5 border-black border-opacity-0 hover:border-opacity-20"
      }
      onClick={() => onClick()}
    >
      {children}
    </button>
  );
}

// -----------------------------------

// Not used directly, used indirect in `Tabs`
export function Tab<T extends string>({ value, label, children }: TabProps<T>) {
  return children as ReactElement<TabProps<T>>;
}

export function Tabs<T extends string>({
  value,
  onChange,
  children,
}: {
  value: T;
  onChange: (v: T) => void;
  children: ReactElement<TabProps<T>>[];
}) {
  React.Children.forEach(children, (c) => {
    if (c.type !== Tab)
      throw new Error("Expecting children to be `Tab` components.");
  });
  const tabsProps = React.Children.map(children, (c) => c?.props);

  return (
    <div
      className="relative z-0" /* new stacking context using 'relative z-0' */
    >
      <div className="relative z-10" style={{ marginBottom: -1 }}>
        {tabsProps.map((p) => {
          if (p === null) return null;
          return (
            <TabButton
              key={p.value}
              isActive={value === p.value}
              onClick={() => onChange(p.value)}
            >
              {p.label}
            </TabButton>
          );
        })}
      </div>
      <div className="p-2 border border-black">
        {tabsProps.find((props) => props?.value === value)?.children}
      </div>
    </div>
  );
}
