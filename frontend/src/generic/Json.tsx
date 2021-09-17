import ReactJson, { ReactJsonViewProps } from "react-json-view";

export function Json({ src, ...rest }: ReactJsonViewProps) {
  return (
    <ReactJson
      name={rest.name}
      src={src}
      displayDataTypes={false}
      quotesOnKeys={false}
      displayObjectSize={false}
      enableClipboard={false}
      {...rest}
    />
  );
}
