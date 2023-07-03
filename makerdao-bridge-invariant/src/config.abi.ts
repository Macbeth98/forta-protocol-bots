const l1ArbitrumEvent =
  'event DepositInitiated(address l1Token, address indexed from, address indexed to, uint256 indexed sequenceNumber, uint256 amount)';

const l1OptimismEvent =
  'event ERC20DepositInitiated (address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)';

const tokenBalanceABI = 'function balanceOf(address) view returns (uint256)';

const totalSupplyABI = 'function totalSupply() view returns (uint256)';

const transferEvent = 'event Transfer(address indexed from, address indexed to, uint256 value)';

const l1ArbitrumEscrowAddress = '0xA10c7CE4b876998858b1a9E12b10092229539400';
const l1ArbitrumGateway = '0xD3B5b60020504bc3489D6949d545893982BA3011';
const l1OptimismEscrowAddress = '0x467194771dAe2967Aef3ECbEDD3Bf9a310C76C65';
const l1OptimismGateway = '0x10E6593CDda8c58a1d0f14C5164B376352a55f2F';

const l1DAIAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
const l2ArbitrumDAIAddress = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
const l2OptimismDAIAddress = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';

const l1DAI_Decimals = 18;

export {
  l1ArbitrumEvent,
  l1OptimismEvent,
  tokenBalanceABI,
  totalSupplyABI,
  transferEvent,
  l1ArbitrumEscrowAddress,
  l1ArbitrumGateway,
  l1OptimismEscrowAddress,
  l1OptimismGateway,
  l1DAIAddress,
  l2ArbitrumDAIAddress,
  l2OptimismDAIAddress,
  l1DAI_Decimals,
};
