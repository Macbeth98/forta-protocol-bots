import { ethers } from 'forta-agent';

import { pool_init_hash_code, uniswapPoolABI } from './uniswapABI';
import { JsonRpcProvider } from '@ethersproject/providers';

const getPoolValues = async (poolAddress: string, provider: JsonRpcProvider) => {
  const poolContract = new ethers.Contract(poolAddress, uniswapPoolABI, provider);
  const poolValues: any[] = await Promise.all([poolContract.token0(), poolContract.token1(), poolContract.fee()]);

  return poolValues;
};

const computePoolAddress = async (factoryAddress: string, poolValues: any[]) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(['address', 'address', 'uint24'], poolValues);
  const salt = ethers.utils.solidityKeccak256(['bytes'], [encodedData]);
  const poolAddress = ethers.utils.getCreate2Address(factoryAddress, salt, pool_init_hash_code);
  return poolAddress;
};

export const isUniswapPoolAddress = async (factoryAddress: string, poolAddress: string, provider: JsonRpcProvider) => {
  const poolValues = await getPoolValues(poolAddress, provider);
  const computedPoolAddress = await computePoolAddress(factoryAddress, poolValues);
  return computedPoolAddress.toLowerCase() === poolAddress.toLowerCase();
};
