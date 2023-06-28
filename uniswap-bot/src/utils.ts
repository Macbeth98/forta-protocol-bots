import { ethers } from 'forta-agent';

import { pool_init_hash_code, uniswapPoolABI } from './uniswapABI';
import { Provider } from '@ethersproject/providers';
import { LRUCache } from 'lru-cache';

export const poolAddressCache: LRUCache<string, boolean> = new LRUCache({ max: 1000000 });

const getPoolValues = async (poolAddress: string, provider: Provider) => {
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

export const isUniswapPoolAddress = async (factoryAddress: string, poolAddress: string, provider: Provider) => {
  if (poolAddressCache.get(poolAddress)) return poolAddressCache.get(poolAddress);
  const poolValues = await getPoolValues(poolAddress, provider);
  const computedPoolAddress = await computePoolAddress(factoryAddress, poolValues);
  const isUniswap = computedPoolAddress.toLowerCase() === poolAddress.toLowerCase();
  poolAddressCache.set(poolAddress, isUniswap);
  return isUniswap;
};
