import { Finding, HandleTransaction, TransactionEvent, FindingSeverity, FindingType, ethers } from 'forta-agent';

const deployerAddress = '0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8';
const fortaContractAddress = '0x61447385b019187daa48e91c55c02af1f1f3f863';

const eventAgentUpdated =
  'event AgentUpdated(uint256 indexed agentId, address indexed by, string metadata, uint256[] chainIds)';

const eventAgentEnabled =
  'event AgentEnabled(uint256 indexed agentId, bool indexed enabled, uint8 permission, bool value)';

const functionCreateAgent =
  'function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds) public';

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
            chainIds: chainIds ? chainIds.map((id: ethers.BigNumber) => id.toString()) : undefined,
          },
        })
      );
    });

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(deployerAddress, fortaContractAddress),
};
