import { HandleTransaction } from 'forta-agent';

import { createAddress } from 'forta-agent-tools';

import { TestTransactionEvent, MockEthersProvider } from 'forta-agent-tools/lib/test';

import { provideHandleTransaction } from './agent';
import { swapEvent } from './uniswapABI';
import { Provider } from '@ethersproject/abstract-provider';

describe('Uniswap V3 Swap Event Detector', () => {
  let handleTransaction: HandleTransaction;

  const mockFactoryAddress = createAddress('0x4');
  let mockProvider: MockEthersProvider;

  beforeAll(() => {
    mockProvider = new MockEthersProvider();
    const provider = mockProvider as unknown as Provider;
    handleTransaction = provideHandleTransaction(mockFactoryAddress, swapEvent, provider);
  });
});
