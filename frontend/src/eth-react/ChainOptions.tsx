import { RadioGroup } from "@headlessui/react";
import { utils } from "ethers";
import { useState } from "react";
import { ErrorMessage } from "../generic/ErrorMessage";
import { chainIdToInfo } from "./chainIdToInfo";
import { InstallMetaMaskMessage } from "./InstallMetaMaskMessage";
import { useMetaMaskEthereum } from "./useMetaMaskEthereum";

export function ChainOptions({ chainIds }: { chainIds: number[] }) {
  const { ethereum, data } = useMetaMaskEthereum();
  const [chainId, setChainId] = useState(data.chainId);

  const updateChainId = (chainId: number) => {
    const hexChainId = utils.hexValue(chainId);
    if (!ethereum) return;
    if (data.chainId === chainId) return;
    ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      })
      .then(() => setChainId(chainId))
      .catch((err) => alert(err.message));
  };

  if (!ethereum) {
    return (
      <ErrorMessage>
        <InstallMetaMaskMessage />
      </ErrorMessage>
    );
  }

  return (
    <div className="flex items-center" style={{ gap: "1em" }}>
      <div className="">Available chains:</div>
      <RadioGroup
        className="flex"
        style={{ gap: "1em" }}
        value={chainId}
        onChange={updateChainId}
      >
        {chainIds.map((chainId) => (
          <RadioGroup.Option key={chainId} value={chainId}>
            {({ checked }) => (
              <span className="pointer">
                <span className="blue f3">{checked ? "⦿" : "⦾"}</span>{" "}
                {chainIdToInfo(chainId).name}
              </span>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  );
}
