import {
  BlockEvent,
  Finding,
  TransactionEvent,
  FindingSeverity,
  FindingType,
  ethers,
  getEthersProvider,
} from 'forta-agent';
import { ProviderCache } from 'forta-agent-tools';
import {
  approveThisFunctionABI,
  getErc20AssetSymbol,
  getReserveValues,
  networks,
  withdrawReservesEventABI,
} from './utils';

let provider: ethers.providers.Provider = ProviderCache.createProxy(getEthersProvider());

export const provideHandleTransaction = (provider: ethers.providers.Provider) => {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const { chainId } = await provider.getNetwork();

    const logs = txEvent.filterLog(withdrawReservesEventABI);

    logs.forEach((log) => {
      const asset = networks.hasAddress(chainId, log.address);

      if (asset === undefined) {
        return;
      }

      const { to, amount } = log.args as unknown as { to: string; amount: ethers.BigNumber };

      findings.push(
        Finding.fromObject({
          name: 'Withdraw-Reserve-Bot',
          description: 'Detects whenever the Compound protocol reserves were withdrawn by the Governor',
          alertId: 'COMP-11',
          protocol: 'Compound V3',
          severity: FindingSeverity.Low,
          type: FindingType.Info,
          metadata: {
            asset,
            to,
            amount: amount.toString(),
          },
        })
      );
    });

    const fns = txEvent.filterFunction(approveThisFunctionABI);

    await Promise.all(
      fns.map(async (fn) => {
        const asset = networks.hasAddress(chainId, fn.address);

        if (asset === undefined) {
          return;
        }

        const args = fn.args;

        findings.push(
          Finding.fromObject({
            name: 'Approve Transfer to Manager',
            description: 'Detects whenever a manager is given an approval to transfer an asset on Compound Protocol',
            alertId: 'COMP-12',
            protocol: 'Compound V3',
            severity: FindingSeverity.Low,
            type: FindingType.Info,
            metadata: {
              asset,
              manager: args.manager,
              approvedAsset: await getErc20AssetSymbol(args.asset, provider, txEvent.blockNumber),
              approvedAssetAddress: args.asset,
              approvedAmount: args.amount.toString(),
            },
          })
        );
      })
    );

    return findings;
  };
};

export function provideHandleBlock(provider: ethers.providers.Provider) {
  return async function handleBlock(blockEvent: BlockEvent) {
    const findings: Finding[] = [];

    const { chainId } = await provider.getNetwork();

    const blockNumber = blockEvent.blockNumber;

    const network = networks[chainId];

    const contracts = network.contracts;

    const assetsDataValues = await Promise.all(
      Object.keys(contracts).map(async (contractAddress) => {
        const reserveValues = await getReserveValues(contractAddress, provider, blockNumber);
        return { asset: contracts[contractAddress], reserveValues };
      })
    );

    assetsDataValues.forEach((assetData) => {
      const [targetReserves, reserves] = assetData.reserveValues;
      if (reserves.lt(targetReserves)) {
        findings.push(
          Finding.fromObject({
            name: 'Reserves Tracker Bot',
            description:
              'Detects if the compound platform reserves are less than the target Reserves. Signaling the opportunity of buying Collaterals',
            alertId: 'COMP-13',
            protocol: 'Compound V3',
            severity: FindingSeverity.High,
            type: FindingType.Info,
            metadata: {
              asset: assetData.asset,
              targetReserves: targetReserves.toString(),
              reserves: reserves.toString(),
            },
          })
        );
      }
    });

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(provider),
  provideHandleBlock,
  handleBlock: provideHandleBlock(provider),
};
