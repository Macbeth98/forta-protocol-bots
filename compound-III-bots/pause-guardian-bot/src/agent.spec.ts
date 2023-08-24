import { Finding, FindingSeverity, FindingType, HandleTransaction, ethers } from 'forta-agent';
import { createAddress } from 'forta-agent-tools';
import { MockEthersProvider, TestTransactionEvent } from 'forta-agent-tools/lib/test';
import { provideHandleTransaction, provideInitialize } from './agent';
import { AssetData, networks, pauseEventABI, pauseGuardianEventABI } from './utils';

const chainIds = [1, 137, 42161, 5];

const getRandomChainId = () => {
  return chainIds[parseInt((Math.random() * 3).toFixed(0))];
};

describe('Pause Guardian Bot Tracker', () => {
  let handleTransaction: HandleTransaction;

  let mockProvider: MockEthersProvider;

  let initialize: () => Promise<void>;

  const mockRandomAddress = createAddress('0x876');
  const mockCometProxy = createAddress('0x8765');
  const mockOldPauseGuardian = createAddress('0x67');
  const mockNewPauseGuardian = createAddress('0x68');

  const mockAsset = 'USDC';

  beforeAll(async () => {
    mockProvider = new MockEthersProvider();
    const provider = mockProvider as unknown as ethers.providers.Provider;

    initialize = provideInitialize(provider);

    handleTransaction = provideHandleTransaction(provider);
  });

  const pauseEventInputs = [true, true, true, false, false];
  const pauseGuardianEventInputs = [mockCometProxy, mockOldPauseGuardian, mockNewPauseGuardian];

  describe('handleTransaction', () => {
    let txEvent: TestTransactionEvent;
    let chainId: number;
    let mockAssetData: AssetData;

    beforeEach(async () => {
      txEvent = new TestTransactionEvent();

      chainId = getRandomChainId();

      mockAssetData = networks[chainId].assets[mockAsset];

      mockProvider.setNetwork(chainId);

      await initialize();
    });

    it('ignores a transaction that is not a PauseAction Event or SetPauseGuardian Event', async () => {
      txEvent.setFrom(mockRandomAddress).setTo(mockAssetData.comet).setValue('1234567');

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('ignores a transaction that is a PauseAction Event but not from a Compound V3 Protocol', async () => {
      txEvent.addEventLog(pauseEventABI, mockRandomAddress, pauseEventInputs);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('ignores a transaction that is a SetPauseGuardian Event but not from a Compound V3 Protocol', async () => {
      txEvent.addEventLog(pauseGuardianEventABI, mockRandomAddress, pauseGuardianEventInputs);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('returns a finding that is a PauseAction Event from a Compound V3 Protocol', async () => {
      txEvent.addEventLog(pauseEventABI, mockAssetData.comet, pauseEventInputs);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Compound Pause Tracker',
          description: 'Detects whenever the Compound III protocol functionality is paused',
          alertId: 'COMP-01',
          protocol: 'Compound V3',
          severity: FindingSeverity.Critical,
          type: FindingType.Suspicious,
          metadata: {
            chainId: chainId.toString(),
            asset: mockAsset,
            supplyPaused: pauseEventInputs[0].toString(),
            transferPaused: pauseEventInputs[1].toString(),
            withdrawPaused: pauseEventInputs[2].toString(),
            absorbPaused: pauseEventInputs[3].toString(),
            buyPaused: pauseEventInputs[4].toString(),
          },
        }),
      ]);
    });

    it('returns a finding that is a SetPauseGuardianEvent from a Compound V3 protocol', async () => {
      txEvent.addEventLog(pauseGuardianEventABI, mockAssetData.configurator, pauseGuardianEventInputs);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Compound PauseGuardian Tracker',
          description: 'Detects whenever the PauseGuardian of a Compound protocol is changed',
          alertId: 'COMP-02',
          protocol: 'Compound V3',
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          metadata: {
            chainId: chainId.toString(),
            asset: mockAsset,
            cometProxy: mockCometProxy,
            oldPauseGuardian: mockOldPauseGuardian,
            newPauseGuardian: mockNewPauseGuardian,
          },
        }),
      ]);
    });
  });
});
