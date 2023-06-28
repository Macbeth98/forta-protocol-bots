export const nethermindDeployerAddress = '0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8';
export const fortaContractAddress = '0x61447385b019187daa48e91c55c02af1f1f3f863';

export const eventAgentUpdated =
  'event AgentUpdated(uint256 indexed agentId, address indexed by, string metadata, uint256[] chainIds)';

export const eventAgentEnabled =
  'event AgentEnabled(uint256 indexed agentId, bool indexed enabled, uint8 permission, bool value)';

export const functionCreateAgent =
  'function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds) public';

export interface FindingAgentInput {
  name: string;
  description: string;
  alertId: string;
}

const createAgentInput: FindingAgentInput = {
  name: 'Bot Deployment Detector',
  description: 'Bot deployment detected',
  alertId: 'FORTA-1',
};

const updateAgentInput: FindingAgentInput = {
  name: 'Bot Updates Detector',
  description: 'Bot update/upgrade detected',
  alertId: 'FORTA-2',
};

const enableAgentInput: FindingAgentInput = {
  name: 'Enable Bot Detector',
  description: 'Detects whenever a bot is enabled',
  alertId: 'FORTA-3',
};

const disableAgentInput: FindingAgentInput = {
  name: 'Disable Bot Detector',
  description: 'Detects whenever a bot is disabled',
  alertId: 'FORTA-4',
};

export const findingAgentInputs = {
  create: createAgentInput,
  update: updateAgentInput,
  enable: enableAgentInput,
  disable: disableAgentInput,
};
