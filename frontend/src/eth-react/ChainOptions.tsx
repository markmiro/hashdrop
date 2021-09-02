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
    <div className="flex flex-col sm:flex-row sm:gap-2">
      <div className="">Available chains:</div>
      <RadioGroup
        className="flex flex-col sm:flex-row sm:gap-2"
        value={chainId}
        onChange={updateChainId}
      >
        {chainIds.map((chainId) => (
          <RadioGroup.Option key={chainId} value={chainId}>
            {({ checked }) => (
              <span className="cursor-default bg-black bg-opacity-0 hover:bg-opacity-10">
                <span className="text-black">{checked ? "⦿" : "⦾"}</span>{" "}
                {chainIdToInfo(chainId).name}
              </span>
            )}
          </RadioGroup.Option>
        ))}
      </RadioGroup>
    </div>
  );
}
