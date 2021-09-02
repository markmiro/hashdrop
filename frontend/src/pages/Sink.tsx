import { FC, ReactNode, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DropCount } from "../components/DropCount";
import { AddressLink } from "../eth-react/AddressLink";
import { ChainOptions } from "../eth-react/ChainOptions";
import { EthEnsure } from "../eth-react/EthEnsure";
import { EthErrorFallback } from "../eth-react/EthErrorFallback";
import { NonceErrorMessage } from "../eth-react/NonceErrorMessage";
import { Cid } from "../eth-react/Cid";
import { ErrorMessage } from "../generic/ErrorMessage";
import { GenericError } from "../generic/GenericError";
import { Loader } from "../generic/Loader";
import { Tab, Tabs } from "../generic/Tabs";

const KitchenItems: FC = ({ children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y divide-black">
    {children}
  </div>
);

const Item: FC<{ title: ReactNode }> = ({ title, children }) => (
  <>
    <div className="col-span-1 font-semibold bg-black text-white">
      &lt;{title}&gt;
    </div>
    <div className="col-span-2">{children}</div>
  </>
);

function TabExample() {
  type T = "TAB1" | "TAB2";
  const [tab, setTab] = useState<T>("TAB1");

  return (
    <Tabs<T> value={tab} onChange={setTab}>
      <Tab label="Tab 1" value="TAB1">
        <b>Tab 1: </b>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Optio dolore
        earum facere officia possimus neque error blanditiis?
      </Tab>
      <Tab label="Tab 2" value="TAB2">
        <b>Tab 2: </b>
        Maiores libero dolore enim nisi, quam, provident tempora, explicabo
        magnam tempore error molestiae.
      </Tab>
    </Tabs>
  );
}

export function Sink() {
  return (
    <KitchenItems>
      <Item title="Tabs">
        <TabExample />
      </Item>
      <Item title="Loader">
        <Loader>Lorem ipsum</Loader>
      </Item>
      <Item title="ChainOptions">
        <ChainOptions chainIds={[1337, 1, 3, 4, 42, 5]} />
      </Item>
      <Item title="Cid">
        <Cid cid="bafkreigrzc22o6la4hvhotxvvqmul4juiydhtotyhr4oz2skercvcjbvwq" />
      </Item>
      <Item title="AddressLink">
        <div className="flex flex-col items-start gap-1">
          <AddressLink address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" />
          <AddressLink address="0xeF0Aa769717A29Cc5E094886b85dF35CCfA4e3ad" />
          <AddressLink />
        </div>
      </Item>
      <Item title="DropCount">
        <ErrorBoundary FallbackComponent={EthErrorFallback}>
          <DropCount />
        </ErrorBoundary>
      </Item>
      <Item title="GenericError">
        <GenericError tryAgain={() => alert("tryAgain() called")}>
          Sample Error
        </GenericError>
      </Item>
      <Item title="ErrorMessage">
        <ErrorMessage>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic beatae in
          illo, neque iure architecto explicabo voluptate labore a iste placeat
          qui quis soluta accusamus reiciendis quaerat quasi dolor. Consequatur.
        </ErrorMessage>
      </Item>
      <Item title="NonceErrorMessage">
        <ErrorMessage>
          <NonceErrorMessage originalMessage={"LOREM IPSUM"} />
        </ErrorMessage>
      </Item>
      <Item title="EthErrorFallback">
        <EthErrorFallback
          error={new Error("Lorem ipsum")}
          resetErrorBoundary={() => alert("resetErrorBoundary()")}
        />
      </Item>
      <Item title="EthEnsure">
        <ErrorBoundary FallbackComponent={EthErrorFallback}>
          <EthEnsure isConnected>Is Connected</EthEnsure>
          <EthEnsure chainIds={[1234]}>Is Connected</EthEnsure>
        </ErrorBoundary>
      </Item>
    </KitchenItems>
  );
}
