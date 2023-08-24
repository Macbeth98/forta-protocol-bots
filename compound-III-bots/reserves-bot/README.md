# Compound Reserves Bot

## Description

This Bot detects at any time if the Compound protcol reserves are less than the target Reserves. This helps to know when the buyCollateralReserves method will be successfull. The Bot also tracks when the govenor withdraw Reserves from the protocol or gives an approval to a manager for an asset.

## Supported Chains

- Ethereum
- Polygon
- Arbitrum
- Goerli

## Alerts

Alerts Fired by this Bot

- COMP-11

  - Fired whenever the govenor withdraw reserve funds from the Compound Protocol.
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata contains:
    - asset: The base asset of the protocol
    - to: the account to which the funds were withdrawn
    - amount: the amount that was withdrawn.

- COMP-12

  - Fired whenever a manager account is given an allowance for the transfer of an asset by the governor on the Compound Protocol
  - Severity is always set to "low"
  - Type is always set to "info"
  - Metadata Contains:
    - asset: The base asset of the protocol
    - manager: The manager account to which allowance is given
    - approvedAsset: The token Symbol of the approved asset
    - approvedAssetAddress: The address of the approved asset
    - approvedAmount: The amount that was approved/given as Allowance

- COMP-13
  - Fired if the compound platform reserves are less than the target Reserves
  - Severity is always set to "high"
  - Type is always set to "info"
  - Metadata contains:
    - asset: The base asset of the protocol
    - targetReserves: The set target reserves on the protocol
    - reserves: The actual reserves on the protocol

## Test Data

The agent behaviour can be verified with the following transactions:

- Block: 9332766; Network: Goerli; AlertId: COMP-13

## Chain RPC URL's

- https://polygon-rpc.com (Polygon)
- https://rpc.ankr.com/arbitrum (Arbirtum)
- https://ethereum-goerli.publicnode.com (Goerli)
