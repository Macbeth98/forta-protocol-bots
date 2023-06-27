# Nethermind Bots Deployment Detector.

## Description

This agent detects the bots that are deployed by the Nethermind team.
Nethemind Bot Deployer Address: 0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8

## Supported Chains

- Polygon

## Alerts

Describe each of the type of alerts fired by this agent

- FORTA-1
  - Fired when a transaction related to forta bot deployment/updates from Nethermind
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata fields consits of agentId and type. The type can be of AgentCreated, AgentUpdated, AgentEnabled, and AgentDisabled depending on the Bot Transaction.

## Test Data

The agent behaviour can be verified with the following transactions:

- 0xca8355b309f8df12e720b0ac9f8bc38edfb3204748e9c29d769401daf2ee9d6c (CreateAgent)
- 0x3c11b0f44725e73a80f43c1a4e5902cef590e970c4d0103834c9fb5f34c7faec (UpdateAgent)
- 0x04b729f62b46c604015dbeb7df9d5e9d92444c1c3dc76613480f3f31bdd9ff1f (EnableAgent)
- 0x9a41dc67848f1852b2af7e84c6901928de349bab62430ae79d824478ad42bb7f (DisbaleAgent)
