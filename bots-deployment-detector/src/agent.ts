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

    const logs = txEvent.filterLog([eventAgentUpdated, eventAgentEnabled], contractAddress);

    const fn = txEvent.filterFunction(functionCreateAgent, contractAddress);

    const addedCreateFindings: { [key: string]: boolean } = {};

    fn.forEach((item) => {
      const { agentId, owner, metadata, chainIds } = item.args;

      if (addedCreateFindings[metadata]) return;

      const findingInput = findingAgentInputs.create;
      const metadataInput = {
        by: owner,
        chainIds: chainIds.map((id: ethers.BigNumber) => id.toString()).join(','),
      };
      findings.push(getFindingObject(findingInput, agentId, metadataInput));
      addedCreateFindings[metadata] = true;
    });

    logs.forEach((log) => {
      const { agentId, by, chainIds } = log.args;
      const { name } = log;

      let findingInput: FindingAgentInput;

      let metadataInput;

      if (name === 'AgentUpdated') {
        const metadata = log.args.metadata;
        if (addedCreateFindings[metadata]) {
          return;
        }
        findingInput = fn.length > 0 ? findingAgentInputs.create : findingAgentInputs.update;
        metadataInput = {
          by,
          chainIds: chainIds.map((id: ethers.BigNumber) => id.toString()).join(','),
        };
        addedCreateFindings[metadata] = true;
      } else {
        findingInput = log.args.enabled ? findingAgentInputs.enable : findingAgentInputs.disable;
        metadataInput = {
          enabled: log.args.enabled.toString(),
          permission: log.args.permission.toString(),
        };
      }

      findings.push(getFindingObject(findingInput, agentId, metadataInput));
    });

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(nethermindDeployerAddress, fortaContractAddress),
};
