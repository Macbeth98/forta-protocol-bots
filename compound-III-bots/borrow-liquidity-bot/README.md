# Compound Account Liquidity State Tracker

## Description

This Bot detects any Absorb Collateral on Compound Protocol. The Bot can also monitor the account state and gives alerts when it is under collaterized or Liquidatable.

## Supported Chains

- Ethereum
- Polygon
- Arbitrum

## Alerts

Alerts Fired by the Bot

- COMP-21

  - Fired when for the given network account's state is in under collateralized or Liquidatable
  - Severity is set to "critical" for Liquidatable and "high" for under collateralized
  - Type is always set to "info"
  - Metadata contains:
    - asset: The base asset of the protocol
    - comet: The comet contract address
    - account: The address of the account for which the state is not safe
    - isBorrowCollateralized: true/false, Is the Account Collateralized or not
    - isLiquidatable: true/false, Is the Account Liquidatabale or not

- COMP-22

  - Fired when the bot detects a Absorb Collateral transaction on Compound Protocol for any of the given network Accounts
  - Severity is always set to "critical"
  - Type is always set to "info"
  - Metadata contains:
    - asset: The base asset of the protocol
    - comet: The comet contract address
    - borrower: The borrower and whose account is absorbed
    - absorber: The address of the account that absorbed the collateral
    - assetAbsorbed: The token symbol of the asset Absorbed
    - collateralAbsorbed: The amount that was absorbed
    - usdvalue: The amount that was absorbed in Usd Value

- COMP-23
  - Fired when the bot detects a Absorb Collateral transaction on Compound Protocol for any of the account not in the given network Accounts
  - Severity is always set to "critical"
  - Type is always set to "info"
  - Metadata contains:
    - asset: The base asset of the protocol
    - comet: The comet contract address
    - borrower: The borrower and whose account is absorbed
    - absorber: The address of the account that absorbed the collateral
    - assetAbsorbed: The token symbol of the asset Absorbed
    - collateralAbsorbed: The amount that was absorbed
    - usdvalue: The amount that was absorbed in Usd Value

## Test Data

The bot behaviour can be verified with the following transactions:

- 0x27af97c0cc40beca2170b9ad88f483956ef2a0b6c5cce25755091fb8a2e4c207
