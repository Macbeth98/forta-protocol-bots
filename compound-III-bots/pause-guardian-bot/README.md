# Pause Guardian Bot

## Description

The bot tracks whenever a protocol functionality is paused. The method pause() in comet contract pauses the ability to supply, transfer, withdraw, absorb, and buy assets in the event of an unforseen vulnerability. This method can only be called by a special account known as `PauseGuardian`. The bot also gives alerts whenever the `PauseGuardian` account is updated.

## Supported Chains

- Ethereum
- Polygon
- Arbitrum
- Ethereum Goeril

## Alerts

Alerts Fired by this Bot.

- COMP-01

  - Fired whenever the Compound's protocol functionality is paused
  - Severity is always set to "critical"
  - Type is always set to "suspicious"
  - Metadata contains:
    - chainId: represents the network/Chain Id
    - asset: The Base asset of Compound protocol
    - supplyPaused: true/false, represents whether the supply methods are paused or not
    - transferPaused: true/false, represents whether transfer is paused or not
    - withdrawPaused: true/false, represents whether withdraw is pause or not
    - absorbPaused: true/false, represents whether absorb is paused or not
    - buyPaused: true/false, represents whether buyCollateral is paused or not

- COMP-02
  - Fired whenever the Compound protocol's PauseGuardian Account is updated
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - chainId: represents the network/Chain Id
    - asset: The Base asset of Compound protocol
    - cometProxy: The address of the Comet proxy contract
    - oldPauseGuardian: The address of old pauseGuardian
    - newPauseGuardian: The address of new pauseGuardian

## Test Data

As of now no real test data found.
