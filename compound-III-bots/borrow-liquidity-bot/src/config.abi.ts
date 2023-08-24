export const cometABI = [
  'function isBorrowCollateralized(address account) public view returns (bool)',
  'function isLiquidatable(address account) public view returns (bool)',
];

export const absorbCollateralEventABI =
  'event AbsorbCollateral(address indexed absorber, address indexed borrower, address indexed asset, uint collateralAbsorbed, uint usdValue)';

export const IErc20 = ['function symbol() public view returns (string)'];
