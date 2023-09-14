# 🕵️ Forta-Protocol-Bots.

![Dancing Cat](https://drive.google.com/uc?id=1Ffj960piN7ek_lipBDW_FRwS_DVL8PzU)

## Description 😄

A suite of forta-agents built using `Forta-Typescript-SDK` that track or a monitor some specific type of transactions or events targeted across diverse Protocols.

## List of Forta-Bots

#### Uniswap

- The Uniswap bot monitors and detects any swap made on Uniswap-v3
- **_Supported Chains_**: Ethereum, Arbitrum, Optimism, Polygon

#### MakerDAO

- This bot focuses on the DAI bridge-invariant of MakerDAO protocol.
- This Bot detects whenever the Inavariant `(L1DAI.balanceOf(L1Escrow) ≥ L2DAI.totalSupply())` is violated between L1 Escrow contract and L2 Chains.
- This Bot also give alerts for every outbound transfer to L1Escrow and an alerts on for every mint of DAI on L2 Chains.
- **_Supported Chains_**: Ethereum, Arbitrum, Optimism

#### Compound III

- There are three bots that are built which monitors or tracks different events or transactions on Compound III protocol.

  - **Borrow-Liquidty-Bot**: This Bot detects any Absorb Collateral on Compound Protocol. The Bot can also monitor the account state and gives alerts when it is under collaterized or Liquidatable.
  - **Pause-Guardian-Bot**: The bot tracks whenever a protocol functionality is paused. The method pause() in comet contract pauses the ability to supply, transfer, withdraw, absorb, and buy assets in the event of an unforseen vulnerability. This method can only be called by a special account known as `PauseGuardian`. The bot also gives alerts whenever the `PauseGuardian` account is updated.
  - **Reserves-Bot**: This Bot detects at any time if the Compound protcol reserves are less than the `target` _Reserves_. This helps to know when the `buyCollateralReserves` method will be successfull. The Bot also tracks when the _`governor withdraw Reserves`_ from the protocol or gives an approval to a manager for an asset.

- **_Supported Chains_**: Ethereum, Polygon, Arbitrum

### 🔜 More Bots to be Added in Future

- **_Stay Tuned...!⏳_**
