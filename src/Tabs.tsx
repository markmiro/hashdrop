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
  const classes = {
    inactive: "pa2 mr2 bg-black-05 b--none",
    active: "pa2 mr2 bg-white bl br bt",
  };

  return (
    <button
      className={isActive ? classes.active : classes.inactive}
      style={{
        borderBottom: 0,
      }}
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
    <div>
      <div className="relative z-1" style={{ marginBottom: -1 }}>
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
      <div className="pa2 ba">
        {tabsProps.find((props) => props?.value === value)?.children}
      </div>
    </div>
  );
}
