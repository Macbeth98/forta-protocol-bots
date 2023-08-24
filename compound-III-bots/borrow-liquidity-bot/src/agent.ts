import {
  BlockEvent,
  Finding,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} from 'forta-agent';
import { ProviderCache, toChecksumAddress } from 'forta-agent-tools';
import { NetworkConstants, assetDecimals, assetsMap, networks, populateAssetsMap } from './network.config';
import { getErc20AssetSymbol, getLiquidityFactorConstants, getNormalizedAmount } from './utils';
import { absorbCollateralEventABI } from './config.abi';

const provider: ethers.providers.Provider = ProviderCache.createProxy(getEthersProvider());
let networkData: NetworkConstants;

export const provideHandleTransaction = (provider: ethers.providers.Provider) => {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const logs = txEvent.filterLog([absorbCollateralEventABI]);

    await Promise.all(
      logs.map(async (log) => {
        const contractAddress = toChecksumAddress(log.address);

        const asset = assetsMap[contractAddress];

        if (asset === undefined) {
          return;
        }

        const args = log.args;

        const collateralAbsorbed: ethers.BigNumber = args.collateralAbsorbed;
        const assetAbsorbed = await getErc20AssetSymbol(args.asset, provider, txEvent.blockNumber);

        const metadata = {
          asset,
          comet: contractAddress,
          borrower: args.borrower,
          absorber: args.absorber,
          assetAbsorbed,
          collateralAbsorbed: getNormalizedAmount(collateralAbsorbed, assetDecimals[assetAbsorbed]).toString(),
          usdValue: args.usdValue.toString(),
        };

        const hasAddress = networkData.accounts.includes(args.borrower);

        findings.push(
          Finding.fromObject({
            name: 'Collateral Absorb Tracker',
            description: "Detects whenever the compound protocol absorbs the user's Collateral",
            alertId: hasAddress ? 'COMP-22' : 'COMP-23',
            protocol: 'Compound V3',
            severity: FindingSeverity.Critical,
            type: FindingType.Info,
            metadata,
          })
        );
      })
    );

    return findings;
  };
};

export const provideHandleBlock = (provider: ethers.providers.Provider) => {
  return async function handleBlock(blockEvent: BlockEvent) {
    const findings: Finding[] = [];

    const accounts = networkData.accounts;
    const contracts = networkData.contracts;

    const blockNumber = blockEvent.blockNumber;

    await Promise.all(
      contracts.map(async (contract) => {
        await Promise.all(
          accounts.map(async (account) => {
            const [isBorrowCollateralized, isLiquidatable] = await getLiquidityFactorConstants(
              contract,
              account,
              provider,
              blockNumber
            );

            if (isBorrowCollateralized) {
              return;
            }

            const findingInput = {
              name: 'Compound User Account Tracker',
              description:
                'Monitors for the user account state on the Compound protocol and alerts if the user state is not safe.',
              alertId: 'COMP-21',
              protocol: 'Compoun V3',
            };

            const metadata = {
              asset: assetsMap[contract],
              comet: contract,
              account,
              isBorrowCollateralized: isBorrowCollateralized.toString(),
              isLiquidatable: isLiquidatable.toString(),
            };

            let finding: Finding;

            if (isLiquidatable) {
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

            findings.push(finding);
          })
        );
      })
    );

    return findings;
  };
};

export const provideInitialize = (provider: ethers.providers.Provider) => {
  return async function initialize() {
    const { chainId } = await provider.getNetwork();
    networkData = networks[chainId];
    populateAssetsMap(chainId);
  };
};

export default {
  provideInitialize,
  initialize: provideInitialize(provider),
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(provider),
  provideHandleBlock,
  handleBlock: provideHandleBlock(provider),
};
