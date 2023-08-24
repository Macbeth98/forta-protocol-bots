import { HandleTransaction, HandleBlock, ethers, Initialize, Finding, FindingSeverity, FindingType } from 'forta-agent';
import { createAddress } from 'forta-agent-tools';
import { MockEthersProvider, TestBlockEvent, TestTransactionEvent } from 'forta-agent-tools/lib/test';
import { provideHandleBlock, provideHandleTransaction, provideInitialize } from './agent';
import { NetworkConstants, assetDecimals, assetsMap, networks } from './network.config';
import { IErc20, absorbCollateralEventABI, cometABI } from './config.abi';
import { getNormalizedAmount } from './utils';

const chainIds = [1, 137, 42161];

const getRandomChainId = () => {
  return chainIds[parseInt((Math.random() * 2).toFixed(0))];
};

describe('Liquidity-Bot-tracker', () => {
  let handleTransaction: HandleTransaction;
  let handleBlock: HandleBlock;
  let initialize: Initialize;

  let ICometFace: ethers.utils.Interface;
  let IErc20Face: ethers.utils.Interface;

  let mockProvider: MockEthersProvider;

  const mockRandomAddress = createAddress('0x87');

  beforeAll(() => {
    mockProvider = new MockEthersProvider();
    const provider = mockProvider as unknown as ethers.providers.Provider;

    initialize = provideInitialize(provider);
    handleTransaction = provideHandleTransaction(provider);
    handleBlock = provideHandleBlock(provider);

    ICometFace = new ethers.utils.Interface(cometABI);
    IErc20Face = new ethers.utils.Interface(IErc20);
  });

  describe('handleBlock: User Account State Tracker', () => {
    let blockEvent: TestBlockEvent;

    let mockNetworkData: NetworkConstants;

    let mockFindings: Finding[] = [];

    beforeEach(async () => {
      const chainId = getRandomChainId();

      mockNetworkData = networks[chainId];

      mockProvider.setNetwork(chainId);
      mockProvider.setLatestBlock(0);

      blockEvent = new TestBlockEvent();
      blockEvent.setNumber(0);

      await initialize();

      mockFindings = [];
    });

    const configureProvider = (output1: boolean, output2: boolean) => {
      for (const contract of mockNetworkData.contracts) {
        for (const account of mockNetworkData.accounts) {
          mockProvider.addCallTo(contract, 0, ICometFace, 'isBorrowCollateralized', {
            inputs: [account],
            outputs: [output1],
          });
          mockProvider.addCallTo(contract, 0, ICometFace, 'isLiquidatable', { inputs: [account], outputs: [output2] });

          if (output1) {
            continue;
          }

          const findingInput = {
            name: 'Compound User Account Tracker',
            description:
              'Monitors for the user account state on the Compound protocol and alerts if the user state is not safe.',
            alertId: 'COMP-21',
            protocol: 'Compoun V3',
          };

          let finding: Finding;

          const metadata = {
            asset: assetsMap[contract],
            comet: contract,
            account,
            isBorrowCollateralized: output1.toString(),
            isLiquidatable: output2.toString(),
          };

          if (output2) {
            finding = Finding.fromObject({
              ...findingInput,
              severity: FindingSeverity.Critical,
              type: FindingType.Info,
              metadata,
            });
          } else {
            finding = Finding.fromObject({
              ...findingInput,
              severity: FindingSeverity.High,
              type: FindingType.Info,
              metadata,
            });
          }

          mockFindings.push(finding);
        }
      }
    };

    it('ignores any block where all the given network accounts are in safe state', async () => {
      configureProvider(true, false);

      const findings = await handleBlock(blockEvent);

      expect(findings).toStrictEqual([]);
    });

    it('returns findings when any of the given network account are under collateralized', async () => {
      configureProvider(false, false);

      const findings = await handleBlock(blockEvent);

      expect(findings[0].severity).toStrictEqual(FindingSeverity.High);
      expect(findings).toStrictEqual(mockFindings);
    });

    it('returns findings when any of the given network account are liquidatable', async () => {
      configureProvider(false, true);

      const findings = await handleBlock(blockEvent);

      expect(findings[0].severity).toStrictEqual(FindingSeverity.Critical);
      expect(findings).toStrictEqual(mockFindings);
    });
  });

  describe('handleTransaction: Collateral Absorb Tracker', () => {
    let txEvent: TestTransactionEvent;
    let mockAssetContract: string;
    let mockAsset: string;
    let mockNetworkData: NetworkConstants;
    let mockBorrowerFromAccounts: string = '';

    const mockAbsorberAccount = createAddress('0x876');

    const mockAssetToken = createAddress('0x7434');

    const mockCollateralAbsorbed = '9876543212345678';
    const mockUsdValue = '987654';

    beforeEach(async () => {
      let chainId = getRandomChainId();

      mockNetworkData = networks[chainId];
      mockAssetContract = mockNetworkData.contracts[0];
      mockAsset = mockNetworkData.assets[0];
      mockBorrowerFromAccounts = mockNetworkData.accounts[0];

      mockProvider.setNetwork(chainId);
      mockProvider.setLatestBlock(0);

      await initialize();

      txEvent = new TestTransactionEvent();
      txEvent.setBlock(0);
    });

    const configureProvider = (contractAddress: string) => {
      mockProvider.addCallTo(contractAddress, 0, IErc20Face, 'symbol', { inputs: [], outputs: [mockAsset] });
    };

    it('ignores any transaction that is not an Absorb Collateral', async () => {
      txEvent.setFrom(mockRandomAddress).setTo(mockAssetContract).setValue('987654');

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('ignores any transaction that is an Absorb Collateral but not from Compound', async () => {
      txEvent.addEventLog(absorbCollateralEventABI, mockRandomAddress, [
        mockAbsorberAccount,
        mockBorrowerFromAccounts,
        mockAssetToken,
        mockCollateralAbsorbed,
        mockUsdValue,
      ]);

      configureProvider(mockAssetToken);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([]);
    });

    it('returns a finding with alertId: COMP-22 for a transaction that is an absorb Collateral on the Compound for one of the network account', async () => {
      txEvent.addEventLog(absorbCollateralEventABI, mockAssetContract, [
        mockAbsorberAccount,
        mockBorrowerFromAccounts,
        mockAssetToken,
        mockCollateralAbsorbed,
        mockUsdValue,
      ]);

      configureProvider(mockAssetToken);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Collateral Absorb Tracker',
          description: "Detects whenever the compound protocol absorbs the user's Collateral",
          alertId: 'COMP-22',
          protocol: 'Compound V3',
          severity: FindingSeverity.Critical,
          type: FindingType.Info,
          metadata: {
            asset: mockAsset,
            comet: mockAssetContract,
            borrower: mockBorrowerFromAccounts,
            absorber: mockAbsorberAccount,
            assetAbsorbed: mockAsset,
            collateralAbsorbed: getNormalizedAmount(
              ethers.BigNumber.from(mockCollateralAbsorbed),
              assetDecimals[mockAsset]
            ).toString(),
            usdValue: mockUsdValue,
          },
        }),
      ]);
    });

    it('returns a finding with alertId: COMP-23 for a transaction that is an absorb Collateral on the Compound not in network Accounts', async () => {
      txEvent.addEventLog(absorbCollateralEventABI, mockAssetContract, [
        mockAbsorberAccount,
        mockRandomAddress,
        mockAssetToken,
        mockCollateralAbsorbed,
        mockUsdValue,
      ]);

      configureProvider(mockAssetToken);

      const findings = await handleTransaction(txEvent);

      expect(findings).toStrictEqual([
        Finding.fromObject({
          name: 'Collateral Absorb Tracker',
          description: "Detects whenever the compound protocol absorbs the user's Collateral",
          alertId: 'COMP-23',
          protocol: 'Compound V3',
          severity: FindingSeverity.Critical,
          type: FindingType.Info,
          metadata: {
            asset: mockAsset,
            comet: mockAssetContract,
            borrower: mockRandomAddress,
            absorber: mockAbsorberAccount,
            assetAbsorbed: mockAsset,
            collateralAbsorbed: getNormalizedAmount(
              ethers.BigNumber.from(mockCollateralAbsorbed),
              assetDecimals[mockAsset]
            ).toString(),
            usdValue: mockUsdValue,
          },
        }),
      ]);
    });
  });
});
