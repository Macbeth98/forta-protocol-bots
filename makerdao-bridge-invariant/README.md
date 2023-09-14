# MakerDAO's Bridge Invariant

## Description

This Bot detects whenever the Inavariant `(L1DAI.balanceOf(L1Escrow) ≥ L2DAI.totalSupply())` is violated between L1 Escrow contract and L2 Chains. This Bot also give alerts for every outbound transfer to L1Escrow and an alerts on for every mint of DAI on L2 Chains.

## Supported Chains

- Ethereum
- Arbitrum
- Optimism

## Alerts

Alerts fired by this Bot

- L1_ARBITRUM

  - Fired when a transaction contains a DAI outbound transfer to Arbitrum L1 Escrow
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - l1Token: DAI token address on L1 (Ethereum) Chain.
    - from: Sender of DAI tokens
    - to: recipient of DAI tokens on L2 chain
    - sequenceNumber: The sequence number of the transaction on L1 that initiated the deposit
    - amount: The amount of tokens being transferred
    - tokenBalance: The DAI token balance of Arbirtum L1 Escrow contract
    - blockNumber: The block number of the transaction

- L1_OPTIMISM

  - Fired when a transaction contains a DAI outbound transfer to Optimism L1 Escrow
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - l1Token: DAI token address on L1 (Ethereum) Chain.
    - from: Sender of DAI tokens
    - to: recipient of DAI tokens on L2 chain
    - amount: The amount of tokens being transferred
    - l2Token: DAI token address on Optimism chain
    - tokenBalance: The DAI token balance of Optimism L1 Escrow contract
    - blockNumber: The block number of the transaction

- L2_ARBITRUM

  - Fired when a transaction contains a DAI transfer from Null (addr('0x0')) on L2 Arbitrum chain (Mint of DAI)
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - to: The recipient of the DAI tokens
    - value: The amount of tokens in the transfer
    - totalSupply: The total supply of DAI tokens on L2 Arbitrum chain

- L2_OPTIMISM

  - Fired when a transaction contains a DAI transfer from Null (addr('0x0')) on L2 Optimism chain (Mint of DAI)
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - to: The recipient of the DAI tokens
    - value: The amount of tokens in the transfer
    - totalSupply: The total supply of DAI tokens on L2 Optimism chain

- ARBITRUM_INVARIANT

  - Fired whenever the Inavriant (L1 Escrow >= L2 total Supply) is violated between Arbitrum L1 Escrow and Arbitrum L2 Chain
  - Severity is always set to "critical"
  - Type is always set to "exploit"
  - Metadata contains:
    - tokenBalance: The DAI token balance of L1 Arbitrum Escrow contract
    - totalSupply: The total supply of DAI tokens on L2 Arbitrum chain
    - l1BlockNumber: The Block Number of txn on L1
    - l2BlockNumber: The Block Number at txn on\

- OPTIMISM_INVARIANT

  - Fired whenever the Inavriant (L1 Escrow >= L2 total Supply) is violated between Optimism L1 Escrow and Optimism L2 Chain
  - Severity is always set to "critical"
  - Type is always set to "exploit"
  - Metadata contains:
    - tokenBalance: The DAI token balance of L1 Optimism Escrow contract
    - totalSupply: The total supply of DAI tokens on L2 Optimism chain
    - l1BlockNumber: The Block Number of txn on L1
    - l2BlockNumber: The Block Number at txn on L2

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x8ee0465ab7745541f694d7159052e98104a456e6842df0c7e2837e5c8eaed9f6 (Arbitrum L2)
- 0x27a4444abf085304c967a9ea0b3bb313a7ce6eeaf246192edd2b6283c580863e (Arbitrum L2)
- 0xbe8e902a16c1a747d338598bf985527bc43f2c1301c7da37b3142ce26de3cd3a (Optimism L2)
- 0xf5901e7bde1c88614ea53db58e61e80880ef1eb4e8513bb4d1b9502700a7e24e (Arbitrum L1)
- 0x962b6a99fd007f9878ac005c789d8a4b7d73d7b0e910f06020754fed27c26c07 (Optimism L1)

## L2 Chains RPC URL end points

- https://rpc.ankr.com/arbitrum (Arbitrum)
- https://mainnet.optimism.io (Optimism)
