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
      const invariantFinding = networkManager.get('invariantFinding');

      console.log('Network....', networkManager.get('network'));

      const logs = txEvent.filterLog(transferEvent);

      await Promise.all(
        logs.map(async (log) => {
          try {
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

            console.log('TotalSupply...', totalSupply.toString());

            const mintFinding = finding(
              to,
              getNormalizedAmount(value, l1DAI_Decimals).toString(),
              totalSupply.toString()
            );

            findings.push(mintFinding);

            const blockTimestamp = txEvent.block.timestamp;

            const { alerts } = await getL1Alerts(alertId, blockTimestamp);

            if (alerts.length > 0) {
              const l1Alert = alerts[0];

              const tokenBalance = ethers.BigNumber.from(l1Alert.metadata.tokenBalance);

              if (tokenBalance.lt(totalSupply)) {
                const metadata = {
                  tokenBalance: tokenBalance.toString(),
                  totalSupply: totalSupply.toString(),
                  l1BlockNumber: l1Alert.metadata.blockNumber,
                  l2BlockNumber: txEvent.block.number.toString(),
                };

                findings.push(invariantFinding(metadata));
              }
            }
          } catch (e) {
            console.log('Yo in errorrr....');
            console.log(e);
            return;
          }
        })
      );
    }

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(getEthersProvider()),
};
