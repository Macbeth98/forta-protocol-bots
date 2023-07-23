import { Finding, FindingSeverity, FindingType, getAlerts } from 'forta-agent';
import { l1DAIAddress, l2ArbitrumDAIAddress, l2OptimismDAIAddress } from './config.abi';

export interface NetworkData {
  id: number;
  network: string;
  erc20Address: string;
  alertId: string;
  findingInput?: (to: string, value: string, totalSupply: string) => Finding;
  invariantFinding?: (metadata: { [key: string]: string }) => Finding;
}

const _30Mins = 30 * 60 * 1000;

export const getL1Alerts = async (alertId: string, blockTimestamp: number) => {
  const alerts = await getAlerts({
    botIds: ['0x7041c3cbfa296b42c9bb621ebf332d8faddb4967f9b6e8e7bc538efb0688a941'],
    alertId,
    first: 1,
    blockDateRange: {
      startDate: new Date(blockTimestamp * 1000 - _30Mins),
      endDate: new Date(blockTimestamp * 1000),
    },
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

export const arbitrumInvariantFinding = (metadata: { [key: string]: string }) => {
  return Finding.fromObject({
    name: 'Arbitrum Invariant',
    description:
      'Detects whenever the Inavriant (L1 Escrow >= L2 total Supply) is violated between Arbitrum L1 Escrow and Arbitrum L2 Chain',
    alertId: 'ARBITRUM_INVARIANT',
    protocol: 'Arbitrum: MakerDAO DAI Bridge',
    severity: FindingSeverity.Critical,
    type: FindingType.Exploit,
    metadata: metadata,
  });
};

export const optimismInvariantFinding = (metadata: { [key: string]: string }) => {
  return Finding.fromObject({
    name: 'Optimism Invariant',
    description:
      'Detects whenever the Inavriant (L1 Escrow >= L2 total Supply) is violated between Optimism L1 Escrow and Optimism L2 Chain',
    alertId: 'OPTIMISM_INVARIANT',
    protocol: 'Optimism: MakerDAO DAI Bridge',
    severity: FindingSeverity.Critical,
    type: FindingType.Exploit,
    metadata: metadata,
  });
};

export const networkData: Record<number, NetworkData> = {
  1: {
    id: 1,
    network: 'Ethereum',
    erc20Address: l1DAIAddress,
    alertId: '',
  },
  42161: {
    id: 42161,
    network: 'Arbitrum',
    erc20Address: l2ArbitrumDAIAddress,
    alertId: 'L1_ARBITRUM',
    findingInput: l2ArbitrumFinding,
    invariantFinding: arbitrumInvariantFinding,
  },
  10: {
    id: 10,
    network: 'Optimism',
    alertId: 'L1_OPTIMISM',
    erc20Address: l2OptimismDAIAddress,
    findingInput: l2OptimismFinding,
    invariantFinding: optimismInvariantFinding,
  },
};
