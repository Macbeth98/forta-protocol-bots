import { Finding, TransactionEvent, FindingSeverity, FindingType, getEthersProvider } from 'forta-agent';

import { swapEvent, uniswapV3FactoryAddress } from './uniswapABI';
import { Provider } from '@ethersproject/providers';
import { isUniswapPoolAddress } from './utils';

export function provideHandleTransaction(factoryAddress: string, swapEvent: string, provider: Provider) {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const logs = txEvent.filterLog(swapEvent);

    for (const log of logs) {
      const poolAddress = log.address;
      const isUniswapPool = await isUniswapPoolAddress(factoryAddress, poolAddress, provider);
      if (!isUniswapPool) {
        continue;
      }

      const { sender, recipient, amount0, amount1, liquidity } = log.args;

      findings.push(
        Finding.fromObject({
          name: 'Uniswap V3 Swap Detector',
          description: 'This Bot detects the Swaps executed on Uniswap V3',
          alertId: 'FORTA-1',
          severity: FindingSeverity.Info,
          type: FindingType.Info,
          protocol: 'UniswapV3',
          metadata: {
            sender,
            recipient,
            amount0: amount0.toString(),
            amount1: amount1.toString(),
            liquidity: liquidity.toString(),
          },
        })
      );
    }

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(uniswapV3FactoryAddress, swapEvent, getEthersProvider()),
};
