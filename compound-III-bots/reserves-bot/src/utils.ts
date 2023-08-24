import { ethers } from 'forta-agent';
import { toChecksumAddress } from 'forta-agent-tools';

export const withdrawReservesEventABI = 'event WithdrawReserves(address indexed to, uint amount)';

export const approveThisFunctionABI = 'function approveThis(address manager, address asset, uint amount) external';

export const reservesABI = [
  'function targetReserves() external view returns (uint)',
  'function getReserves() public view returns (int)',
];

export const IErc20 = ['function symbol() public view returns (string)'];

export interface NetworkConstants {
  networkName: string;
  contracts: { [key: string]: string };
}

export const networks: { [key: number]: NetworkConstants; hasAddress: typeof hasAddress } = {
  1: {
    networkName: 'Ethereum Mainnet',
    contracts: {
      '0xc3d688B66703497DAA19211EEdff47f25384cdc3': 'USDC',
      '0xA17581A9E3356d9A858b789D68B4d866e593aE94': 'WETH',
    },
  },
  137: {
    networkName: 'Polygon',
    contracts: {
      '0xF25212E676D1F7F89Cd72fFEe66158f541246445': 'USDC',
    },
  },
  42161: {
    networkName: 'Arbitrum',
    contracts: {
      '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA': 'USDC',
    },
  },
  5: {
    networkName: 'Ethereum Goerli',
    contracts: {
      '0x3EE77595A8459e93C2888b13aDB354017B198188': 'USDC',
    },
  },
  hasAddress: hasAddress,
};

function hasAddress(id: number, address: string): string | undefined {
  const network = networks[id];
  if (network === undefined) {
    return undefined;
  }

  return network.contracts[toChecksumAddress(address)];
}

export async function getErc20AssetSymbol(address: string, provider: ethers.providers.Provider, blockNumber: number) {
  const contract = new ethers.Contract(address, IErc20, provider);

  const symbol = await contract.symbol({ blockTag: blockNumber });

  return symbol.toString();
}

const getReserveContract = (address: string, provider: ethers.providers.Provider) => {
  return new ethers.Contract(address, reservesABI, provider);
};

export async function getReserveValues(address: string, provider: ethers.providers.Provider, blockNumber: number) {
  const contract = getReserveContract(address, provider);
  const reserveValues: ethers.BigNumber[] = await Promise.all([
    contract.targetReserves({ blockTag: blockNumber }),
    contract.getReserves({ blockTag: blockNumber }),
  ]);

  return reserveValues;
}
