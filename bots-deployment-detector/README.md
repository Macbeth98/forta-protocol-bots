# Nethermind Bots Deployment Detector.

## Description

This agent detects the bots that are deployed by the Nethermind team.

## Supported Chains

- Ethereum

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Fired when a transaction contains a Tether transfer over 10,000 USDT
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metada fields will be mentioned here.

## Test Data

The agent behaviour can be verified with the following transactions:

- 0x3a0f757030beec55c22cbc545dd8a844cbbb2e6019461769e1bc3f3a95d10826 (15,000 USDT)
