import { provideHandleTransaction } from './agent';

import { Finding, FindingSeverity, FindingType, HandleTransaction } from 'forta-agent';

import { createAddress } from 'forta-agent-tools';
import { TestTransactionEvent } from 'forta-agent-tools/lib/test';

import { eventAgentEnabled, eventAgentUpdated, functionCreateAgent } from './utils';

describe('Bot Deployment Detector Agent', () => {
  let handleTransaction: HandleTransaction;

  const mockDeployerAdddress = createAddress('0x4');
  const mockContractAddress = createAddress('0x5');
  const mockRandomAddress = createAddress('0x8');

  const mockAgentId = '34567';
  const mockChainId = 137;
  const eventTypes = ['AgentCreated', 'AgentUpdated', 'AgentEnabled', 'AgentDisabled'];

  beforeAll(() => {
    handleTransaction = provideHandleTransaction(mockDeployerAdddress, mockContractAddress);
  });

  describe('handleTransaction', () => {
    describe('Ignores Transaction', () => {
      it('ignores any transaction that is not a from deployer Address', async () => {
        const txEvent = new TestTransactionEvent();
        const findings = await handleTransaction(txEvent);

        expect(findings).toStrictEqual([]);
      });

      it('ignores a transaction that is from a deployer Address but not a bot deployment', async () => {
        const txEvent = new TestTransactionEvent();
        txEvent.setFrom(mockDeployerAdddress).setTo(mockRandomAddress).setValue('100000');

        const findings = await handleTransaction(txEvent);

        expect(findings).toStrictEqual([]);
      });

      it('ignores a transaction that is from a deployer Address and bot deployment but to a different bot registry/contract', async () => {
        const txEvent = new TestTransactionEvent();
        txEvent.setFrom(mockDeployerAdddress).setTo(mockRandomAddress);

        txEvent.addTraces({
          function: functionCreateAgent,
          from: mockDeployerAdddress,
          to: mockRandomAddress,
          arguments: [mockAgentId, mockDeployerAdddress, '', [mockChainId]],
        });

        const findings = await handleTransaction(txEvent);

        expect(findings).toStrictEqual([]);
      });
    });

    describe('Returns a Finding', () => {
      let txEvent: TestTransactionEvent;

      const updateInputs = [mockAgentId, mockDeployerAdddress, '', [mockChainId]];
      const enableInputs = [mockAgentId, true, 1, true];
      const disableInputs = [mockAgentId, false, 1, false];

      const findingInput = {
        name: 'Bot Deployment Detector',
        description: 'Bot deployment/upgrade detected',
        alertId: 'FORTA-1',
        severity: FindingSeverity.Info,
        type: FindingType.Info,
      };

      beforeEach(() => {
        txEvent = new TestTransactionEvent();
        txEvent.setFrom(mockDeployerAdddress).setTo(mockContractAddress);
      });

      it('returns a finding with metadata.type: "AgentUpdated" when the transaction is from deployer to update/upgrade of a bot', async () => {
        txEvent.addEventLog(eventAgentUpdated, mockContractAddress, updateInputs);

        const findings = await handleTransaction(txEvent);

        expect(findings).toStrictEqual([
          Finding.fromObject({
            ...findingInput,
            metadata: {
              agentId: mockAgentId,
              type: eventTypes[1],
              by: mockDeployerAdddress,
              chainIds: mockChainId.toString(),
            },
          }),
        ]);
      });

      it('returns a finding with metadata.type: "AgentCreated" when transaction is from deployer for the deployment of the bot', async () => {
        txEvent.addEventLog(eventAgentUpdated, mockContractAddress, updateInputs);

        txEvent.addTraces({
          function: functionCreateAgent,
          arguments: [mockAgentId, mockDeployerAdddress, '', [mockChainId]],
          from: mockDeployerAdddress,
          to: mockContractAddress,
        });

        const findings = await handleTransaction(txEvent);

        expect(findings).toStrictEqual([
          Finding.fromObject({
            ...findingInput,
            metadata: {
              agentId: mockAgentId,
              type: eventTypes[0],
              by: mockDeployerAdddress,
              chainIds: mockChainId.toString(),
            },
          }),
        ]);
      });

      it('returns a finding with metadata.type: "AgentEnabled" when the transaction is from deployer for enabling the Agent', async () => {
        txEvent.addEventLog(eventAgentEnabled, mockContractAddress, enableInputs);

        const findings = await handleTransaction(txEvent);

        expect(findings).toEqual([
          Finding.fromObject({
            ...findingInput,
            metadata: {
              agentId: mockAgentId,
              type: eventTypes[2],
            },
          }),
        ]);
      });

      it('returns a finding with metadata.type: "AgentDisbaled" when the transaction is from deployer for disabling the Agent', async () => {
        txEvent.addEventLog(eventAgentEnabled, mockContractAddress, disableInputs);

        const findings = await handleTransaction(txEvent);

        expect(findings).toEqual([
          Finding.fromObject({
            ...findingInput,
            metadata: {
              agentId: mockAgentId,
              type: eventTypes[3],
            },
          }),
        ]);
      });
    });
  });
});
