import { ethers } from 'forta-agent';

import { pool_init_hash_code, uniswapPoolABI } from './uniswapABI';
import { Provider } from '@ethersproject/providers';
import { LRUCache } from 'lru-cache';

export const poolAddressCache: LRUCache<string, boolean> = new LRUCache({ max: 1000000 });

const getPoolValues = async (poolAddress: string, provider: Provider, blockNumber: number) => {
  const poolContract = new ethers.Contract(poolAddress, uniswapPoolABI, provider);
  const poolValues: any[] = await Promise.all([
    poolContract.token0({ blockTag: blockNumber }),
    poolContract.token1({ blockTag: blockNumber }),
    poolContract.fee({ blockTag: blockNumber }),
  ]);

  return poolValues;
};

export const computePoolAddress = (factoryAddress: string, poolValues: any[]) => {
  const encodedData = ethers.utils.defaultAbiCoder.encode(['address', 'address', 'uint24'], poolValues);
  const salt = ethers.utils.solidityKeccak256(['bytes'], [encodedData]);
  const poolAddress = ethers.utils.getCreate2Address(factoryAddress, salt, pool_init_hash_code);
  return poolAddress;
};

export const isUniswapPoolAddress = async (
  factoryAddress: string,
  poolAddress: string,
  provider: Provider,
  blockNumber: number
) => {
  if (poolAddressCache.get(poolAddress)) return poolAddressCache.get(poolAddress);
  const poolValues = await getPoolValues(poolAddress, provider, blockNumber);
  const computedPoolAddress = computePoolAddress(factoryAddress, poolValues);
  const isUniswap = computedPoolAddress.toLowerCase() === poolAddress.toLowerCase();
  poolAddressCache.set(poolAddress, isUniswap);
  return isUniswap;
};
