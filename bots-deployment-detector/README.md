# Nethermind Bots Detector.

## Description

This forta bot detects the bots that are deployed by the Nethermind team. The bot also detects any updates to a bot including enabling and disabling of a bot from Nethermind.
Nethemind Bot Deployer Address: `0x88dC3a2284FA62e0027d6D6B1fCfDd2141a143b8`

## Supported Chains

- Polygon

## Alerts

Alerts fired by this bot

- FORTA-1

  - Fired when a forta bot is `deployed` by Nethermind
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - `agentId`: The unique identifier for the bot
    - `by`: Owner of the bot
    - `chainIds`: The blockchain networks that the bot is configured to scan

- FORTA-2

  - Fired when a forta bot owned by Nethermind is `updated/upgraded`
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - `agentId`: The unique identifier for the bot
    - `by`: Owner of the bot
    - `chainIds`: The blockchain networks that the bot is configured to scan

- FORTA-3

  - Fired when a forta bot owned by Nethermind is `Enabled`
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - `agentId`: The unique identifier for the bot
    - `enabled`: Signifies that the bot is enabled (true)
    - `permission`: The permission level of the bot

- FORTA-4
  - Fired when a forta bot owned by Nethermind is `Disabled`
  - Severity is always set to "info"
  - Type is always set to "info"
  - Metadata contains:
    - `agentId`: The unique identifier for the bot
    - `enabled`: Signifies that the bot is enabled (true)
    - `permission`: The permission level of the bot

## Test Data

The Forta Bot behaviour can be verified with the following transactions:

- 0xca8355b309f8df12e720b0ac9f8bc38edfb3204748e9c29d769401daf2ee9d6c (CreateAgent)
- 0x3c11b0f44725e73a80f43c1a4e5902cef590e970c4d0103834c9fb5f34c7faec (UpdateAgent)
- 0x04b729f62b46c604015dbeb7df9d5e9d92444c1c3dc76613480f3f31bdd9ff1f (EnableAgent)
- 0x9a41dc67848f1852b2af7e84c6901928de349bab62430ae79d824478ad42bb7f (DisableAgent)
