import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType, ethers } from 'forta-agent';

import {
  nethermindDeployerAddress,
  fortaContractAddress,
  eventAgentUpdated,
  eventAgentEnabled,
  functionCreateAgent,
} from './utils';

export function provideHandleTransaction(deployerAddress: string, contractAddress: string): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    if (txEvent.from.toLowerCase() !== deployerAddress.toLowerCase()) {
      return findings;
    }

    const logs = txEvent.filterLog([eventAgentUpdated, eventAgentEnabled], contractAddress);

    const fn = txEvent.filterFunction(functionCreateAgent, contractAddress);

    logs.forEach((log) => {
      const { agentId, by, chainIds } = log.args;
      const { name } = log;

      let eventType = name;

      if (name === 'AgentUpdated') {
        if (fn.length > 0) {
          eventType = 'AgentCreated';
        }
      } else if (name === 'AgentEnabled') {
        eventType = log.args.enabled ? 'AgentEnabled' : 'AgentDisabled';
      }

      findings.push(
        Finding.fromObject({
          name: 'Bot Deployment Detector',
          description: 'Bot deployment/upgrade detected',
          alertId: 'FORTA-1',
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            agentId: agentId.toString(),
            type: eventType,
            by,
            chainIds: chainIds ? chainIds.map((id: ethers.BigNumber) => id.toString()).join(',') : undefined,
          },
        })
      );
    });

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(nethermindDeployerAddress, fortaContractAddress),
};
