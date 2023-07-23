import { FindingSeverity, FindingType, LogDescription, ethers } from 'forta-agent';
import { FindingInput, getNormalizedAmount } from './utils';

export const arbitrumL1EscrowFinding = (
  log: LogDescription,
  tokenAddress: string,
  decimals: number
): FindingInput | null => {
  const { l1Token, from, to, sequenceNumber, amount } = log.args as unknown as {
    l1Token: string;
    from: string;
    to: string;
    sequenceNumber: ethers.BigNumber;
    amount: ethers.BigNumber;
  };

  if (l1Token.toLowerCase() !== tokenAddress.toLowerCase()) {
    return null;
  }

  const normalizedAmount = getNormalizedAmount(amount, decimals);

  return {
    name: 'Arbitrum L1 DAI Escrow',
    description: 'Detects the outbound transfers of DAI to Arbitrum L1 Escrow',
    alertId: 'L1_ARBITRUM',
    protocol: 'Ethereum: L1Escrow',
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      l1Token: l1Token.toLowerCase(),
      from: from.toLowerCase(),
      to: to.toLowerCase(),
      sequenceNumber: sequenceNumber.toString(),
      amount: normalizedAmount.toString(),
    },
  };
};

export const optimismL1EscrowFinding = (
  log: LogDescription,
  tokenAddress: string,
  decimals: number
): FindingInput | null => {
  const { _l1Token, _l2Token, _from, _to, _amount } = log.args as unknown as {
    _l1Token: string;
    _l2Token: string;
    _from: string;
    _to: string;
    _amount: ethers.BigNumber;
  };

  if (_l1Token.toLowerCase() !== tokenAddress.toLowerCase()) {
    return null;
  }

  const normalizedAmount = getNormalizedAmount(_amount, decimals);
  return {
    name: 'Optimism L1 DAI Escrow',
    description: 'Detects the outbound transfers of DAI to Optimism L1 Escrow',
    alertId: 'L1_OPTIMISM',
    protocol: 'Ethereum: L1Escrow',
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      l1Token: _l1Token.toLowerCase(),
      from: _from.toLowerCase(),
      to: _to.toLowerCase(),
      amount: normalizedAmount.toString(),
      l2Token: _l2Token.toLowerCase(),
    },
  };
};
