import { Finding, FindingSeverity, FindingType, getAlerts } from 'forta-agent';
import { l2ArbitrumDAIAddress, l2OptimismDAIAddress } from './config.abi';

interface NetworkData {
  id: number;
  network: string;
  erc20Address: string;
  alertId: string;
  findingInput: (to: string, value: string, totalSupply: string) => Finding;
}

export const getL1Alerts = async (alertId: string, blockTimestamp: number) => {
  const alerts = await getAlerts({
    botIds: ['0x7041c3cbfa296b42c9bb621ebf332d8faddb4967f9b6e8e7bc538efb0688a941'],
    alertId,
  });

  return alerts;
};

export const l2ArbitrumFinding = (to: string, value: string, totalSupply: string) => {
  return Finding.fromObject({
    name: 'Arbitrum DAI MINT',
    description: 'Detects whenever new DAI is minted on Arbitrum L2 chain',
    alertId: 'L2_ARBITRUM',
    protocol: 'Arbitrum',
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      to,
      value,
      totalSupply,
    },
  });
};

export const l2OptimismFinding = (to: string, value: string, totalSupply: string) => {
  return Finding.fromObject({
    name: 'Optimism DAI MINT',
    description: 'Detects whenever new DAI is minted on Optimism L2 chain',
    alertId: 'L2_OPTIMISM',
    protocol: 'Optimism',
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      to,
      value,
      totalSupply,
    },
  });
};

export const networkData: Record<number, NetworkData> = {
  42161: {
    id: 42161,
    network: 'Arbitrum',
    erc20Address: l2ArbitrumDAIAddress,
    alertId: 'L1_ARBITRUM',
    findingInput: l2ArbitrumFinding,
  },
  10: {
    id: 10,
    network: 'Optimism',
    alertId: 'L1_OPTIMISM',
    erc20Address: l2OptimismDAIAddress,
    findingInput: l2OptimismFinding,
  },
};
