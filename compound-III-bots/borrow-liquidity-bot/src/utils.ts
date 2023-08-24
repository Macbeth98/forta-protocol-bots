import { ethers } from 'forta-agent';
import { IErc20, cometABI } from './config.abi';

export const getLiquidityFactorConstants = async (
  contractAddress: string,
  accountAddress: string,
  provider: ethers.providers.Provider,
  blockNumber: number
) => {
  const contract = new ethers.Contract(contractAddress, cometABI, provider);

  const isBorrowCollateralized: boolean = await contract.isBorrowCollateralized(accountAddress, {
    blockTag: blockNumber,
  });

  if (isBorrowCollateralized) {
    return [true, false];
  }

  const isLiquidatable: boolean = await contract.isLiquidatable(accountAddress, { blockTag: blockNumber });
  return [isBorrowCollateralized, isLiquidatable];
};

export async function getErc20AssetSymbol(address: string, provider: ethers.providers.Provider, blockNumber: number) {
  const contract = new ethers.Contract(address, IErc20, provider);

  const symbol = await contract.symbol({ blockTag: blockNumber });

  return symbol.toString();
}

export const getNormalizedAmount = (amount: ethers.BigNumber, decimals: number) => {
  const divValue = ethers.BigNumber.from((10 ** decimals).toString());
  return amount.div(divValue);
};
