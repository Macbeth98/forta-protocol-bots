export const nethermindDeployerAddress = '0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8';
export const fortaContractAddress = '0x61447385b019187daa48e91c55c02af1f1f3f863';

export const eventAgentEnabled =
  'event AgentEnabled(uint256 indexed agentId, bool indexed enabled, uint8 permission, bool value)';

export const functionCreateAgent =
  'function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds) public';

export const functionUpdateAgent = 'function updateAgent(uint256 agentId, string metadata, uint256[] chainIds)';

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
  description: 'Bot Enabled detected',
  alertId: 'FORTA-3',
};

const disableAgentInput: FindingAgentInput = {
  name: 'Disable Bot Detector',
  description: 'Bot Disabled detected',
  alertId: 'FORTA-4',
};

export const findingAgentInputs = {
  create: createAgentInput,
  update: updateAgentInput,
  enable: enableAgentInput,
  disable: disableAgentInput,
};
