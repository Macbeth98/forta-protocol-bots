import { Alert, AlertsResponse, Finding, FindingSeverity, FindingType, HandleTransaction, ethers } from 'forta-agent';

import { MockEthersProvider, TestTransactionEvent } from 'forta-agent-tools/lib/test';
import { provideHandleTransaction, provideInitialize } from './agent';
import { createAddress } from 'forta-agent-tools';
import {
  l1ArbitrumEscrowAddress,
  l1ArbitrumEvent,
  l1ArbitrumGateway,
  l1DAIAddress,
  l1DAI_Decimals,
  l1OptimismEscrowAddress,
  l1OptimismEvent,
  l1OptimismGateway,
  l2ArbitrumDAIAddress,
  l2OptimismDAIAddress,
  tokenBalanceABI,
  totalSupplyABI,
  transferEvent,
} from './config.abi';
import { getNormalizedAmount } from './utils';
import {
  arbitrumInvariantFinding,
  l2ArbitrumFinding,
  l2OptimismFinding,
  networkData,
  optimismInvariantFinding,
} from './L2helper';

describe("MakerDAO's Bridge Invariant Bot", () => {
  let handleTransaction: HandleTransaction;

  let mockProvider: MockEthersProvider;

  let initialize: () => Promise<void>;

  const mockRandomAddress = createAddress('0x89');

  let ItokenBalance: ethers.utils.Interface;
  let ItotalSupply: ethers.utils.Interface;

  const mockDAIDepositValue = ethers.BigNumber.from('98765443299099098765');

  const mockTokenBalance = ethers.BigNumber.from('98769876543234590909099');
  const mockTotalSupply = ethers.BigNumber.from('99876543223456780988989898989');

  const mockGetAlerts = jest.fn();

  beforeAll(async () => {
    mockProvider = new MockEthersProvider();
    const provider = mockProvider as unknown as ethers.providers.Provider;

    initialize = provideInitialize(provider, networkData);

    handleTransaction = provideHandleTransaction(provider, mockGetAlerts);

    ItokenBalance = new ethers.utils.Interface([tokenBalanceABI]);
    ItotalSupply = new ethers.utils.Interface([totalSupplyABI]);
  });

  const networks = [
    {
      chainId: 42161,
      network: 'Arbitrum',
      erc20Address: l2ArbitrumDAIAddress,
      mockFinding: l2ArbitrumFinding(
        mockRandomAddress,
        getNormalizedAmount(mockDAIDepositValue, l1DAI_Decimals).toString(),
        getNormalizedAmount(mockTotalSupply, l1DAI_Decimals).toString()
      ),
      mockInvariantFinding: arbitrumInvariantFinding({
        tokenBalance: getNormalizedAmount(mockTokenBalance, l1DAI_Decimals).toString(),
        totalSupply: getNormalizedAmount(mockTotalSupply, l1DAI_Decimals).toString(),
        l1BlockNumber: '0',
        l2BlockNumber: '0',
      }),
    },
    {
      chainId: 10,
      network: 'Optimism',
      erc20Address: l2OptimismDAIAddress,
      mockFinding: l2OptimismFinding(
        mockRandomAddress,
        getNormalizedAmount(mockDAIDepositValue, l1DAI_Decimals).toString(),
        getNormalizedAmount(mockTotalSupply, l1DAI_Decimals).toString()
      ),
      mockInvariantFinding: optimismInvariantFinding({
        tokenBalance: getNormalizedAmount(mockTokenBalance, l1DAI_Decimals).toString(),
        totalSupply: getNormalizedAmount(mockTotalSupply, l1DAI_Decimals).toString(),
        l1BlockNumber: '0',
        l2BlockNumber: '0',
      }),
    },
  ];

  const l1ArbitrumEventInputs = [l1DAIAddress, mockRandomAddress, mockRandomAddress, 9876, mockDAIDepositValue];
  const l1OptimismEventInputs = [
    l1DAIAddress,
    l2OptimismDAIAddress,
    mockRandomAddress,
    mockRandomAddress,
    mockDAIDepositValue,
    [],
  ];

  const mockArbitrumFinding = Finding.fromObject({
    name: 'Arbitrum L1 DAI Escrow',
    description: 'Detects the outbound transfers of DAI to Arbitrum L1 Escrow',
    alertId: 'L1_ARBITRUM',
    protocol: 'Ethereum: L1Escrow',
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      l1Token: l1DAIAddress.toLowerCase(),
      from: mockRandomAddress,
      to: mockRandomAddress,
      sequenceNumber: l1ArbitrumEventInputs[3].toString(),
      amount: getNormalizedAmount(mockDAIDepositValue, l1DAI_Decimals).toString(),
      tokenBalance: getNormalizedAmount(mockTokenBalance, l1DAI_Decimals).toString(),
      blockNumber: '0',
    },
  });

  const mockOptimismFinding = Finding.fromObject({
    name: 'Optimism L1 DAI Escrow',
    description: 'Detects the outbound transfers of DAI to Optimism L1 Escrow',
    alertId: 'L1_OPTIMISM',
    protocol: 'Ethereum: L1Escrow',
    severity: FindingSeverity.Info,
    type: FindingType.Info,
    metadata: {
      l1Token: l1DAIAddress.toLowerCase(),
      from: mockRandomAddress,
      to: mockRandomAddress,
      amount: getNormalizedAmount(mockDAIDepositValue, l1DAI_Decimals).toString(),
      l2Token: l2OptimismDAIAddress.toLowerCase(),
      tokenBalance: getNormalizedAmount(mockTokenBalance, l1DAI_Decimals).toString(),
      blockNumber: '0',
    },
  });

  const configProviderWithTokenBalance = (inputAddress: string) => {
    mockProvider.addCallTo(l1DAIAddress, 0, ItokenBalance, 'balanceOf', {
      inputs: [inputAddress],
      outputs: [mockTokenBalance],
    });

    mockProvider.setLatestBlock(0);
  };

  describe('L1 Escrow Alerts', () => {
    let txEvent: TestTransactionEvent;

    beforeEach(async () => {
      txEvent = new TestTransactionEvent();
      txEvent.setBlock(0);

      mockProvider.setNetwork(1);

      await initialize();

      mockProvider.setLatestBlock(0);
    });

    it('ignores a transaction that is not a L1 Escrow Outbound transfer', async () => {
      txEvent.setFrom(mockRandomAddress).setTo(l1ArbitrumEscrowAddress).setValue('12345');

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('ignores a transaction that is a L1 Escrow Outbound Transfer but not an Arbirtum or Optimism Escrow', async () => {
      txEvent.addEventLog(l1ArbitrumEvent, mockRandomAddress, l1ArbitrumEventInputs);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('returns a finding when a L1 DAI Escrow Outbound Transfer transaction sent to Arbitrum L1 Escrow', async () => {
      txEvent.addEventLog(l1ArbitrumEvent, l1ArbitrumGateway, l1ArbitrumEventInputs);

      configProviderWithTokenBalance(l1ArbitrumEscrowAddress);

      const findings = await handleTransaction(txEvent);

      expect(findings.length).toStrictEqual(1);
      expect(findings).toStrictEqual([mockArbitrumFinding]);
    });

    it('returns a finding when a L1 DAI Escrow Outbound Transfer transaction sent to Optimism L1 Escrow', async () => {
      txEvent.addEventLog(l1OptimismEvent, l1OptimismGateway, l1OptimismEventInputs);

      configProviderWithTokenBalance(l1OptimismEscrowAddress);

      const findings = await handleTransaction(txEvent);

      expect(findings.length).toStrictEqual(1);
      expect(findings).toStrictEqual([mockOptimismFinding]);
    });
  });

  describe('L2 DAI mint Alerts', () => {
    let txEvent: TestTransactionEvent;

    beforeEach(() => {
      txEvent = new TestTransactionEvent();
      txEvent.setBlock(0);

      mockProvider.setLatestBlock(0);
    });

    test.each(networks)(
      `ignores any transaction that is not a DAI transferEvent on L2 $network chain`,
      async ({ chainId, erc20Address }) => {
        mockProvider.setNetwork(chainId);

        await initialize();

        txEvent.setFrom(mockRandomAddress).setTo(erc20Address).setValue('9876554');

        const findings = await handleTransaction(txEvent);
        expect(findings).toStrictEqual([]);
      }
    );

    test.each(networks)(
      `ignores any transaction that is a DAI transferEvent but is not a mint on L2 $network chain`,
      async ({ chainId, erc20Address }) => {
        mockProvider.setNetwork(chainId);

        await initialize();

        txEvent.addEventLog(transferEvent, erc20Address, [mockRandomAddress, mockRandomAddress, mockDAIDepositValue]);

        const findings = await handleTransaction(txEvent);
        expect(findings).toStrictEqual([]);
      }
    );

    test.each(networks)(
      `returns a finding that is a DAI transferEvent and is a Mint`,
      async ({ chainId, erc20Address, mockFinding }) => {
        mockProvider.setNetwork(chainId);

        await initialize();

        txEvent.block.timestamp = Date.now() / 1000;

        txEvent.addEventLog(transferEvent, erc20Address, [
          createAddress('0x0'),
          mockRandomAddress,
          mockDAIDepositValue,
        ]);

        mockProvider.addCallTo(erc20Address, 0, ItotalSupply, 'totalSupply', {
          inputs: [],
          outputs: [mockTotalSupply],
        });

        mockGetAlerts.mockReturnValueOnce({ alerts: [] });

        const findings = await handleTransaction(txEvent);
        expect(findings).toStrictEqual([mockFinding]);
      }
    );
  });

  describe('Inavariant Detection', () => {
    let txEvent: TestTransactionEvent;

    beforeEach(() => {
      txEvent = new TestTransactionEvent();
      txEvent.setBlock(0);
      txEvent.block.timestamp = Date.now() / 1000;

      // mockGetAlerts.mockClear();
    });

    test.each(networks)(
      `returns a Finding when the L1 Escrow DAI balance is less than L2 $network DAI total Supply`,
      async ({ chainId, erc20Address, mockFinding, mockInvariantFinding }) => {
        mockProvider.setNetwork(chainId);

        await initialize();

        txEvent.block.timestamp = Date.now() / 1000;

        txEvent.addEventLog(transferEvent, erc20Address, [
          createAddress('0x0'),
          mockRandomAddress,
          mockDAIDepositValue,
        ]);

        mockProvider.addCallTo(erc20Address, 0, ItotalSupply, 'totalSupply', {
          inputs: [],
          outputs: [mockTotalSupply],
        });

        const l1_Finding = mockArbitrumFinding;

        const l1Alert: Alert = {
          alertId: l1_Finding.alertId,
          chainId: 1,
          metadata: l1_Finding.metadata,
          hasAddress: (address: string) => true,
        };

        const l1Alerts: AlertsResponse = {
          alerts: [l1Alert],
          pageInfo: {
            hasNextPage: false,
          },
        };

        mockGetAlerts.mockReturnValueOnce(l1Alerts);

        const findings = await handleTransaction(txEvent);
        expect(findings.length).toStrictEqual(2);
        expect(findings[0]).toStrictEqual(mockFinding);
        expect(findings[1]).toStrictEqual(mockInvariantFinding);
      }
    );
  });
});
