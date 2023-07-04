# MakerDAO's Bridge Invariant

## Description

This Bot detects whenever the Inavariant (L1DAI.balanceOf(L1Escrow) ≥ L2DAI.totalSupply()) is violated between L1 Escrow contract and L2 Chains. This Bot also give alerts for every outbound transfer to L1Escrow and an alerts on for every mint of DAI on L2 Chains.

## Supported Chains

- Ethereum
- Arbitrum
- Optimism

## Alerts

Alerts fired by this Bot

- FORTA-1
  - Fired when a transaction contains a Tether transfer over 10,000 USDT
  - Severity is always set to "low" (mention any conditions where it could be something else)
  - Type is always set to "info" (mention any conditions where it could be something else)
  - Mention any other type of metadata fields included with this alert

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x8ee0465ab7745541f694d7159052e98104a456e6842df0c7e2837e5c8eaed9f6 (Arbitrum L2)
- 0x27a4444abf085304c967a9ea0b3bb313a7ce6eeaf246192edd2b6283c580863e (Arbitrum L2)
- 0xbe8e902a16c1a747d338598bf985527bc43f2c1301c7da37b3142ce26de3cd3a (Optimism L2)
- 0xf5901e7bde1c88614ea53db58e61e80880ef1eb4e8513bb4d1b9502700a7e24e (Arbitrum L1)
- 0x962b6a99fd007f9878ac005c789d8a4b7d73d7b0e910f06020754fed27c26c07 (Optimism L1)

## L2 Chains RPC URL end points

- https://rpc.ankr.com/arbitrum (Arbitrum)
- https://rpc.ankr.com/optimism (Optimism)
