import { accountsByNetworks } from './network.accounts';

export interface NetworkConstants {
  network: string;
  contracts: string[];
  assets: string[];
  accounts: string[];
}

export const assetsMap: { [key: string]: string } = {};

export const assetDecimals: { [key: string]: number } = {
  USDC: 6,
  WETH: 18,
};

export const networks: { [key: number]: NetworkConstants } = {
  1: {
    network: 'Ethereum',
    contracts: ['0xc3d688B66703497DAA19211EEdff47f25384cdc3', '0xA17581A9E3356d9A858b789D68B4d866e593aE94'],
    assets: ['USDC', 'WETH'],
    accounts: accountsByNetworks[1],
  },
  137: {
    network: 'Polygon',
    contracts: ['0xF25212E676D1F7F89Cd72fFEe66158f541246445'],
    assets: ['USDC'],
    accounts: accountsByNetworks[137],
  },
  42161: {
    network: 'Arbitrum',
    contracts: ['0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA'],
    assets: ['USDC'],
    accounts: accountsByNetworks[42161],
  },
};

export const populateAssetsMap = (id: number) => {
  const network = networks[id];
  network.contracts.forEach((contract, index) => {
    assetsMap[contract] = network.assets[index];
  });
};
