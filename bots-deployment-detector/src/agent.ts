import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType, ethers } from 'forta-agent';

import {
  nethermindDeployerAddress,
  fortaContractAddress,
  eventAgentUpdated,
  eventAgentEnabled,
  functionCreateAgent,
  findingAgentInputs,
  FindingAgentInput,
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

      let findingInput: FindingAgentInput;

      let metadataInput;

      if (name === 'AgentUpdated') {
        findingInput = fn.length > 0 ? findingAgentInputs.create : findingAgentInputs.update;
        metadataInput = {
          by,
          chainIds: chainIds.map((id: ethers.BigNumber) => id.toString()).join(','),
        };
      } else {
        // => name = 'AgentEnabled'
        findingInput = log.args.enabled ? findingAgentInputs.enable : findingAgentInputs.disable;
        metadataInput = {
          enabled: log.args.enabled.toString(),
          permission: log.args.permission.toString(),
        };
      }

      findings.push(
        Finding.fromObject({
          ...findingInput,
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            agentId: agentId.toString(),
            ...metadataInput,
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
