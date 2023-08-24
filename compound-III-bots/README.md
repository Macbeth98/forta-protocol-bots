# Compound III Protocol.

## Summary

- Compound III is a powerful tool that allows users to earn interest on their cryptocurrency deposits and borrow other assets against their collateral.The protocol is designed to be secure, efficient, and easy to use.
- Comet is the main contract of the Compound III protocol featuring a base asset and collateral assets. This comet contract instance is deployed for every base asset.
- Users can supply the base asset and earn interest on the supplied asset. Users can also supply the collateral asset and borrow a certain amount of base token. The borrowing and repaying of assets depends on the below mentioned collateral factors.
- Each collateral asset has a defiend collateral factors such as `borrowCollateralFactor` which defines the percentage of collateral value the user is allowed to borrow in base asset and `liquidateCollateralFactor` which defines the percentage of collateral value the user is allowed to have in outstanding borrows before aa liquidation occurs.
- Compound III protocol is currently live on Ethereum Mainnet with USDC and WETH as base assets.

## Proposed Bots:

- COMP01: Pause Guardian Bot
  - The bot tracks whenever a protocol functionality is paused. The method pause() in `comet` contract pauses the ability to supply, transfer, withdraw, absorb, and buy assets in the event of an unforseen vulnerability.
  - This method can only be called by a special account known as `PauseGuardian`.
  - This alert can let the users know that there is some vulnerability or a critical issue in the protocol through which the users can be aware of the issue before it is too late.
  - The bot also monitors whenever the `PauseGuardian` was changed.
- COMP02: Reserves Bot
  - The bot detects at any time if the compound protocol reserves are less than the target Reserves.
  - This alert can let the users know that they can initiate buyCollateralReserves and get Assets for a lesser price
  - The Bot also tracks when the govenor withdraw Reserves from the protocol or gives an approval to a manager for an asset.
  - This gives awareness to the users of when and where the reserve funds were being moved.
- COMP03: Compound Account Liquidity State
  - This Bot detects any Absorb Collateral on Compound Protocol. The Bot can also monitor the account state and gives alerts when it is under collaterized or Liquidatable.
  - By giving alerts when the user account is not in a safe state, the user can take precautions to avoid liquidation
  - The detection of absorption gives users awareness of how much were being absorbed

## Proposed Solution:

- COMP01: Pause Guardian Bot
  - To monitor the protocol's pause functionality, the bot looks for the `PauseAction` in the transactions that are of Comet transactions.
  - To monitor the change in `PauseGuardian`, `SetPauseGuardian` event is monitored.
- COMP02: Reserves Bot
  - To monitor the change in reserves, the bot get the current Actual Reserves and the target Reserves at each block and sends an alert if the actual reserves is less than the target reserves.
  - The Bot tracks the transactions with event `WithdrawReserves` to alert when the reserves were being withdrawn
  - The Bot tracks the transactions with traces of function `approveThis` and sends an alert
- COMP03: Compound Account Liquidity State
  - To monitor the Absorption of Collateral the bot tracks the transactions with `AbsorbCollateral` event.
  - Checking the state for every account is not a viable solution. So the bot has a predefined set of acounts for which the state needs to be monitored per network at each block.
  - The bot get the result from the methods `isBorrowCollateralized` & `isLiquidatable` to determine the state of the Account and sends an alert
