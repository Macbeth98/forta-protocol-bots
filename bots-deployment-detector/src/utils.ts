export const nethermindDeployerAddress = '0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8';
export const fortaContractAddress = '0x61447385b019187daa48e91c55c02af1f1f3f863';

export const eventAgentUpdated =
  'event AgentUpdated(uint256 indexed agentId, address indexed by, string metadata, uint256[] chainIds)';

export const eventAgentEnabled =
  'event AgentEnabled(uint256 indexed agentId, bool indexed enabled, uint8 permission, bool value)';

export const functionCreateAgent =
  'function createAgent(uint256 agentId, address owner, string metadata, uint256[] chainIds) public';

export const createAgentABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'agentId', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'string', name: 'metadata', type: 'string' },
      { internalType: 'uint256[]', name: 'chainIds', type: 'uint256[]' },
    ],
    name: 'createAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
