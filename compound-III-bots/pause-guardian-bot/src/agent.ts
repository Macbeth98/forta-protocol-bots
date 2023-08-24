import {
  BlockEvent,
  Finding,
  Initialize,
  HandleBlock,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} from 'forta-agent';
import { networks, pauseEventABI, pauseGuardianEventABI, populateNetworkData } from './utils';

const provider = getEthersProvider();

export const provideHandleTransaction = (provider: ethers.providers.Provider) => {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const { chainId } = await provider.getNetwork();

    const logs = txEvent.filterLog([pauseEventABI, pauseGuardianEventABI]);

    logs.forEach((log) => {
      const contractAddress = log.address.toLowerCase();

      const networkData = networks.getNetworkData.get(contractAddress);

      if (networkData === undefined) {
        return;
      }

      let finding: Finding;

      if (networkData.type === 'comet') {
        const { supplyPaused, transferPaused, withdrawPaused, absorbPaused, buyPaused } = log.args;

        finding = Finding.fromObject({
          name: 'Compound Pause Tracker',
          description: 'Detects whenever the Compound III protocol functionality is paused',
          alertId: 'COMP-01',
          protocol: 'Compound V3',
          severity: FindingSeverity.Critical,
          type: FindingType.Suspicious,
          metadata: {
            chainId: chainId.toString(),
            asset: networkData.asset,
            supplyPaused: supplyPaused.toString(),
            transferPaused: transferPaused.toString(),
            withdrawPaused: withdrawPaused.toString(),
            absorbPaused: absorbPaused.toString(),
            buyPaused: buyPaused.toString(),
          },
        });
      } else {
        const { cometProxy, oldPauseGuardian, newPauseGuardian } = log.args;

        finding = Finding.fromObject({
          name: 'Compound PauseGuardian Tracker',
          description: 'Detects whenever the PauseGuardian of a Compound protocol is changed',
          alertId: 'COMP-02',
          protocol: 'Compound V3',
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            chainId: chainId.toString(),
            asset: networkData.asset,
            cometProxy,
            oldPauseGuardian,
            newPauseGuardian,
          },
        });
      }

      findings.push(finding);
    });

    return findings;
  };
};

export function provideInitialize(provider: ethers.providers.Provider) {
  return async function initialize() {
    const { chainId } = await provider.getNetwork();
    populateNetworkData(chainId);
  };
}

export default {
  provideInitialize,
  initialize: provideInitialize(provider),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(provider),
};
