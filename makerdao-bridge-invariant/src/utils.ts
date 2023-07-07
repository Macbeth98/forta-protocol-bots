import { FindingSeverity, FindingType, ethers, getAlerts } from 'forta-agent';

export type FindingInput = {
  name: string;
  description: string;
  alertId: string;
  protocol?: string;
  severity: FindingSeverity;
  type: FindingType;
  metadata: {
    [key: string]: string;
  };
};

export const getNormalizedAmount = (amount: ethers.BigNumber, decimals: number) => {
  const divValue = ethers.BigNumber.from((10 ** decimals).toString());
  return amount.div(divValue);
};

export const getTokenSupply = async (
  tokenAddress: string,
  decimals: number,
  abi: string[],
  blockNumber: number,
  provider: ethers.providers.Provider
) => {
  const token = new ethers.Contract(tokenAddress, abi, provider);
  const totalSupply: ethers.BigNumber = await token.totalSupply({ blockTag: blockNumber });
  return getNormalizedAmount(totalSupply, decimals);
};
