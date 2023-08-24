export const pauseEventABI =
  'event PauseAction(bool supplyPaused, bool transferPaused, bool withdrawPaused, bool absorbPaused, bool buyPaused)';

export const pauseGuardianEventABI =
  'event SetPauseGuardian(address indexed cometProxy, address indexed oldPauseGuardian, address indexed newPauseGuardian)';

export interface AssetData {
  comet: string;
  configurator: string;
  [key: string]: string;
}

export interface NetworkConstants {
  networkName: string;
  assets: { [key: string]: AssetData };
}

const mappedData = new Map<string, { asset: string; type: string }>();

export const networks: {
  [key: number]: NetworkConstants;
  getNetworkData: typeof mappedData;
} = {
  1: {
    networkName: 'Ethereum Mainnet',
    assets: {
      USDC: {
        comet: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
        configurator: '0x316f9708bB98af7dA9c68C1C3b5e79039cD336E3',
      },
      WETH: {
        comet: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
        configurator: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
      },
    },
  },
  137: {
    networkName: 'Polygon',
    assets: {
      USDC: {
        comet: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
        configurator: '0x83E0F742cAcBE66349E3701B171eE2487a26e738',
      },
    },
  },
  42161: {
    networkName: 'Arbitrum',
    assets: {
      USDC: {
        comet: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
        configurator: '0xb21b06D71c75973babdE35b49fFDAc3F82Ad3775',
      },
    },
  },
  5: {
    networkName: 'Ethereum Goerli',
    assets: {
      USDC: {
        comet: '0x3EE77595A8459e93C2888b13aDB354017B198188',
        configurator: '0xB28495db3eC65A0e3558F040BC4f98A0d588Ae60',
      },
    },
  },
  getNetworkData: mappedData,
};

export const populateNetworkData = (id: number) => {
  const network = networks[id];
  if (network === undefined) {
    return;
  }

  const { assets } = network;

  for (const asset in assets) {
    const assetData = assets[asset];
    for (const type in assetData) {
      mappedData.set(assetData[type].toLowerCase(), { asset, type });
    }
  }

  return;
};
