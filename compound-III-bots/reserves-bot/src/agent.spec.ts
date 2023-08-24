import { Finding, FindingSeverity, FindingType, HandleBlock, HandleTransaction, ethers } from 'forta-agent';
import { createAddress } from 'forta-agent-tools';
import { MockEthersProvider, TestBlockEvent, TestTransactionEvent } from 'forta-agent-tools/lib/test';
import { provideHandleBlock, provideHandleTransaction } from './agent';
import { IErc20, approveThisFunctionABI, networks, reservesABI, withdrawReservesEventABI } from './utils';

const chainIds = [1, 137, 42161, 5];

const getRandomChainId = () => {
  return chainIds[parseInt((Math.random() * 3).toFixed(0))];
};

describe('Compound Reserves Bot', () => {
  let handleTransaction: HandleTransaction;
  let handleBlock: HandleBlock;

  let mockProvider: MockEthersProvider;

  let IErc20Face: ethers.utils.Interface;
  let IReservesABIFace: ethers.utils.Interface;

  const mockRandomAddress = createAddress('0x764');
  const mockGovernor = createAddress('0x999');
  const mockAsset = 'USDC';

  beforeAll(async () => {
    mockProvider = new MockEthersProvider();
    const provider = mockProvider as unknown as ethers.providers.Provider;

    handleBlock = provideHandleBlock(provider);
    handleTransaction = provideHandleTransaction(provider);

    IErc20Face = new ethers.utils.Interface(IErc20);
    IReservesABIFace = new ethers.utils.Interface(reservesABI);
  });

  const mockWithdrawReservesEventInputs = [mockRandomAddress, '987654321098765'];
  const mockApproveThisFunctionInputs = [mockRandomAddress, createAddress('0x543'), '8654321234567'];

  const mockWithdrawReserveFinding = Finding.fromObject({
    name: 'Withdraw-Reserve-Bot',
    description: 'Detects whenever the Compound protocol reserves were withdrawn by the Governor',
    alertId: 'COMP-11',
    protocol: 'Compound V3',
    severity: FindingSeverity.Low,
    type: FindingType.Info,
    metadata: {
      asset: mockAsset,
      to: mockWithdrawReservesEventInputs[0],
      amount: mockWithdrawReservesEventInputs[1],
    },
  });

  const mockApproveThisFinding = Finding.fromObject({
    name: 'Approve Transfer to Manager',
    description: 'Detects whenever a manager is given an approval to transfer an asset on Compound Protocol',
    alertId: 'COMP-12',
    protocol: 'Compound V3',
    severity: FindingSeverity.Low,
    type: FindingType.Info,
    metadata: {
      asset: mockAsset,
      manager: mockApproveThisFunctionInputs[0],
      approvedAsset: mockAsset,
      approvedAssetAddress: mockApproveThisFunctionInputs[1],
      approvedAmount: mockApproveThisFunctionInputs[2],
    },
  });

  describe('handleTransaction: Withdraw and Approve Reserves', () => {
    let txEvent: TestTransactionEvent;
    let mockAssetContract: string;
    let chainId: number;

    beforeEach(() => {
      chainId = getRandomChainId();

      const contracts = networks[chainId].contracts;

      for (const contract in contracts) {
        if (contracts[contract] === mockAsset) {
          mockAssetContract = contract;
          break;
        }
      }

      mockProvider.setNetwork(chainId);
      mockProvider.setLatestBlock(0);

      txEvent = new TestTransactionEvent();
      txEvent.setBlock(0);
    });

    const configureProviderWithErc20Call = (contractAddress: string) => {
      mockProvider.addCallTo(contractAddress, 0, IErc20Face, 'symbol', { inputs: [], outputs: [mockAsset] });
    };

    it('ignores any transaction that is  not a withdrawReserves Event or ApproveThis Function', async () => {
      txEvent.setFrom(mockRandomAddress).setTo(mockAssetContract).setValue('987654');

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('ignores any transaction that is a withdrawReserves Event but  not from Compound Protocol', async () => {
      txEvent.addEventLog(withdrawReservesEventABI, mockRandomAddress, mockWithdrawReservesEventInputs);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('ignores any transaction that is a ApproveThis method but not on Compound protocol', async () => {
      txEvent.addTraces({
        function: approveThisFunctionABI,
        from: mockGovernor,
        to: mockRandomAddress,
        arguments: mockApproveThisFunctionInputs,
      });

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('returns a finding when the transaction is a withdrawReserves event from Compound Protocol', async () => {
      txEvent.addEventLog(withdrawReservesEventABI, mockAssetContract, mockWithdrawReservesEventInputs);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([mockWithdrawReserveFinding]);
    });

    it('returns a finding when the transaction is approveThis function on Compound Protocol', async () => {
      txEvent.addTraces({
        function: approveThisFunctionABI,
        from: mockGovernor,
        to: mockAssetContract,
        arguments: mockApproveThisFunctionInputs,
      });

      configureProviderWithErc20Call(mockApproveThisFunctionInputs[1]);

      const findings = await handleTransaction(txEvent);
      expect(findings).toStrictEqual([mockApproveThisFinding]);
    });

    it('returns two findings when the transaction contains ApproveThis function and withdrawreserves on Compound Protocol', async () => {
      txEvent.addEventLog(withdrawReservesEventABI, mockAssetContract, mockWithdrawReservesEventInputs);

      txEvent.addTraces({
        function: approveThisFunctionABI,
        from: mockGovernor,
        to: mockAssetContract,
        arguments: mockApproveThisFunctionInputs,
      });

      configureProviderWithErc20Call(mockApproveThisFunctionInputs[1]);

      const findings = await handleTransaction(txEvent);
      expect(findings).toStrictEqual([mockWithdrawReserveFinding, mockApproveThisFinding]);
    });
  });

  describe('handleBlock: Less than target reserves Alert', () => {
    let blockEvent: TestBlockEvent;
    let mockContracts: { [key: string]: string };

    let mockFindings: Finding[] = [];

    const mockOutput1 = ['9876543222233'];
    const mockOutput2 = ['876543222233'];

    beforeEach(() => {
      const chainId = getRandomChainId();

      mockContracts = networks[chainId].contracts;

      mockProvider.setNetwork(chainId);
      mockProvider.setLatestBlock(0);

      blockEvent = new TestBlockEvent();
      blockEvent.setNumber(0);

      mockFindings = [];
    });

    const configureProviderWithReserves = (output1: any[], output2: any[], swap: boolean) => {
      for (const contract in mockContracts) {
        mockProvider.addCallTo(contract, 0, IReservesABIFace, 'targetReserves', { inputs: [], outputs: output1 });
        mockProvider.addCallTo(contract, 0, IReservesABIFace, 'getReserves', { inputs: [], outputs: output2 });

        const value1 = ethers.BigNumber.from(output1[0]);
        const value2 = ethers.BigNumber.from(output2[0]);

        if (value2.lt(value1)) {
          mockFindings.push(
            Finding.fromObject({
              name: 'Reserves Tracker Bot',
              description:
                'Detects if the compound platform reserves are less than the target Reserves. Signaling the opportunity of buying Collaterals',
              alertId: 'COMP-13',
              protocol: 'Compound V3',
              severity: FindingSeverity.High,
              type: FindingType.Info,
              metadata: {
                asset: mockContracts[contract],
                targetReserves: output1[0],
                reserves: output2[0],
              },
            })
          );
        }

        if (swap) {
          let temp = output1;
          output1 = output2;
          output2 = temp;
        }
      }
    };

    it('ignores any block that does not the violate the condition (reserves >= targetReserves)', async () => {
      configureProviderWithReserves(mockOutput2, mockOutput1, false);

      const findings = await handleBlock(blockEvent);
      expect(findings).toStrictEqual([]);
    });

    it('returns atleast one finding at a block when the condition (reserves >= targetReserves) is violated', async () => {
      configureProviderWithReserves(mockOutput1, mockOutput2, false);

      const findings = await handleBlock(blockEvent);

      expect(findings).toStrictEqual(mockFindings);
    });

    it('returns only one finding at a block when the condition (reserves >= targetReserves) is  violated on ChainId: 1 for USDC', async () => {
      configureProviderWithReserves(mockOutput1, mockOutput2, true);

      const findings = await handleBlock(blockEvent);
      expect(findings).toStrictEqual(mockFindings);
    });
  });
});
