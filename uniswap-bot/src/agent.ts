import {
  BlockEvent,
  Finding,
  Initialize,
  HandleBlock,
  HandleTransaction,
  HandleAlert,
  AlertEvent,
  TransactionEvent,
  FindingSeverity,
  FindingType,
} from 'forta-agent';

import { swapEvent, uniswapV3Address } from './utils';

function provideHandleTransaction() {
  return async function handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const logs = txEvent.filterLog(swapEvent);

    console.log(logs);

    return findings;
  };
}

export default {
  provideHandleTransaction,
  handleTransaction: provideHandleTransaction(),
};
