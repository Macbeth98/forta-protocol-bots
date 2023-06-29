import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType, ethers } from 'forta-agent';

import {
  nethermindDeployerAddress,
  fortaContractAddress,
  eventAgentEnabled,
  functionCreateAgent,
  functionUpdateAgent,
  findingAgentInputs,
  FindingAgentInput,
} from './utils';

const getFindingObject = (findingInput: FindingAgentInput, agentId: any, metadataInput: any): Finding => {
  return Finding.fromObject({
    ...findingInput,
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      agentId: agentId.toString(),
      ...metadataInput,
    },
  });
};

export function provideHandleTransaction(deployerAddress: string, contractAddress: string): HandleTransaction {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    if (txEvent.from.toLowerCase() !== deployerAddress.toLowerCase()) {
      return findings;
    }

    const logs = txEvent.filterLog([eventAgentEnabled], contractAddress);

    const fnLogs = txEvent.filterFunction([functionCreateAgent, functionUpdateAgent], contractAddress);

    fnLogs.forEach((log) => {
      const { agentId, owner, chainIds } = log.args;
      const fnName = log.name;

      const findingInput = fnName === 'createAgent' ? findingAgentInputs.create : findingAgentInputs.update;
      const metadataInput = {
        by: owner ? owner : txEvent.from,
        chainIds: chainIds.map((id: ethers.BigNumber) => id.toString()).join(','),
      };
      findings.push(getFindingObject(findingInput, agentId, metadataInput));
    });

    logs.forEach((log) => {
      const { agentId, enabled, permission } = log.args;

      const findingInput: FindingAgentInput = enabled ? findingAgentInputs.enable : findingAgentInputs.disable;

      const metadataInput = {
        enabled: enabled.toString(),
        permission: permission.toString(),
      };

      findings.push(getFindingObject(findingInput, agentId, metadataInput));
    });

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(nethermindDeployerAddress, fortaContractAddress),
};
