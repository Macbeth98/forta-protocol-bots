import { Finding, LogDescription, TransactionEvent, ethers } from 'forta-agent';
import { tokenBalanceABI } from './config.abi';
import { FindingInput, getNormalizedAmount } from './utils';

class L1Escrow {
  public network: string;
  public eventAbi: string;
  public escrowAddress: string;
  public gatewayAddress: string;
  public erc20Address: string;
  public erc20Decimals: number;
  public provider: ethers.providers.Provider;

  public l1Finding: (log: LogDescription, tokenAddress: string, decimals: number) => FindingInput | null;

  constructor(
    network: string,
    eventAbi: string,
    escrowAddress: string,
    gatewayAddress: string,
    erc20Address: string,
    erc20Decimals: number,
    provider: ethers.providers.Provider,
    l1Finding: (log: LogDescription, tokenAddress: string, decimals: number) => FindingInput | null
  ) {
    this.network = network;
    this.eventAbi = eventAbi;
    this.escrowAddress = escrowAddress;
    this.gatewayAddress = gatewayAddress;
    this.erc20Address = erc20Address;
    this.erc20Decimals = erc20Decimals;
    this.provider = provider;
    this.l1Finding = l1Finding;
  }

  public async getTokenBalance(blockNumber: number) {
    const token = new ethers.Contract(this.erc20Address, [tokenBalanceABI], this.provider);

    const balance: ethers.BigNumber = await token.balanceOf(this.escrowAddress, { blockTag: blockNumber });

    return balance;
  }

  public async handleTransaction(txEvent: TransactionEvent) {
    const findings: Finding[] = [];

    const logs = txEvent.filterLog(this.eventAbi);

    await Promise.all(
      logs.map(async (log) => {
        if (log.address.toLowerCase() !== this.gatewayAddress.toLowerCase()) {
          return;
        }

        const finding = this.l1Finding(log, this.erc20Address, this.erc20Decimals);

        if (finding) {
          const tokenBalance = await this.getTokenBalance(txEvent.blockNumber);
          finding.metadata.tokenBalance = getNormalizedAmount(tokenBalance, this.erc20Decimals).toString();
          finding.metadata.blockNumber = txEvent.block.number.toString();
          findings.push(Finding.from(finding));
        }
      })
    );

    return findings;
  }
}

export default L1Escrow;
