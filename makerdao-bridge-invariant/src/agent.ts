import { Finding, Initialize, HandleAlert, AlertEvent, TransactionEvent, ethers, getEthersProvider } from 'forta-agent';
import L1Escrow from './L1Escrow.agent';

import {
  l1ArbitrumGateway,
  l1ArbitrumEscrowAddress,
  l1ArbitrumEvent,
  l1DAIAddress,
  l1DAI_Decimals,
  l1OptimismEvent,
  l1OptimismEscrowAddress,
  l1OptimismGateway,
  transferEvent,
  totalSupplyABI,
} from './config.abi';
import { arbitrumL1EscrowFinding, optimismL1EscrowFinding } from './l1Findings';
import { NetworkManager } from 'forta-agent-tools';
import { createAddress } from 'forta-agent-tools/lib/';
import { getNormalizedAmount, getTokenSupply } from './utils';
import { getL1Alerts, networkData } from './L2helper';

function provideHandleTransaction(provider: ethers.providers.Provider) {
  return async function handleTransaction(txEvent: TransactionEvent) {
    let findings: Finding[] = [];

    const { chainId } = await provider.getNetwork();

    if (chainId === 1) {
      const arbitrumL1Escrow = new L1Escrow(
        'Arbitrum',
        l1ArbitrumEvent,
        l1ArbitrumEscrowAddress,
        l1ArbitrumGateway,
        l1DAIAddress,
        l1DAI_Decimals,
        provider,
        arbitrumL1EscrowFinding
      );

      const optimismL1Escrow = new L1Escrow(
        'Optimism',
        l1OptimismEvent,
        l1OptimismEscrowAddress,
        l1OptimismGateway,
        l1DAIAddress,
        l1DAI_Decimals,
        provider,
        optimismL1EscrowFinding
      );

      findings = (
        await Promise.all([
          await arbitrumL1Escrow.handleTransaction(txEvent),
          await optimismL1Escrow.handleTransaction(txEvent),
        ])
      ).flat();
    } else {
      const networkManager = new NetworkManager(networkData);

      await networkManager.init(provider);

      const tokenAddress = networkManager.get('erc20Address');
      const finding = networkManager.get('findingInput');
      const alertId = networkManager.get('alertId');

      const logs = txEvent.filterLog(transferEvent);

      console.log(tokenAddress);

      await Promise.all(
        logs.map(async (log) => {
          if (tokenAddress.toLowerCase() !== log.address.toLowerCase()) {
            return;
          }

          const { from, to, value } = log.args as unknown as { from: string; to: string; value: ethers.BigNumber };

          if (from !== createAddress('0x0')) {
            return;
          }

          const totalSupply: ethers.BigNumber = await getTokenSupply(
            tokenAddress,
            l1DAI_Decimals,
            [totalSupplyABI],
            txEvent.blockNumber,
            provider
          );

          const mintFinding = finding(
            to,
            getNormalizedAmount(value, l1DAI_Decimals).toString(),
            totalSupply.toString()
          );

          findings.push(mintFinding);

          const alerts = await getL1Alerts(alertId, 98765);
          console.log(alerts);
        })
      );
    }

    return findings;
  };
}

const initialize: Initialize = async () => {
  const BotID = '0x7041c3cbfa296b42c9bb621ebf332d8faddb4967f9b6e8e7bc538efb0688a941';
  console.log('BotId', BotID);

  return {
    alertConfig: {
      subscriptions: [
        {
          botId: BotID,
          alertIds: ['L1_ARBITRUM', 'L1_OPTIMISM'],
        },
      ],
    },
  };
};

// const handleBlock: HandleBlock = async (blockEvent: BlockEvent) => {
//   const findings: Finding[] = [];
//   // detect some block condition
//   return findings;
// }

const handleAlert: HandleAlert = async (alertEvent: AlertEvent) => {
  const findings: Finding[] = [];
  // detect some alert condition
  console.log(alertEvent);
  return findings;
};

export default {
  provideHandleTransaction,
  initialize,
  handleTransaction: provideHandleTransaction(getEthersProvider()),
  // handleBlock,
  handleAlert,
};
