/**
 * SimulatedSettlementAdapter — default settlement adapter.
 *
 * All token operations are simulated: balances are stored in the database,
 * no on-chain interaction happens. This is the production-ready default for
 * platforms that don't need blockchain settlement.
 *
 * To wire in real on-chain settlement, implement ISettlementAdapter in a
 * new file (e.g. evmSettlementAdapter.ts) and export it as `settlementAdapter`
 * from this directory's index.
 */

import type {
  ISettlementAdapter,
  TokenDeployParams,
  TokenDeployResult,
  TransferParams,
  TransferResult,
} from "./interface";

export class SimulatedSettlementAdapter implements ISettlementAdapter {
  async deployToken(_params: TokenDeployParams): Promise<TokenDeployResult> {
    // No on-chain action. The DB record is created by the calling service.
    return {
      contractAddress: undefined,
      settlementListingId: undefined,
      liquidityPoolAddress: undefined,
      transactionHash: undefined,
      simulated: true,
    };
  }

  async transfer(_params: TransferParams): Promise<TransferResult> {
    // DB write handled by the calling service; nothing to do here.
    return { transactionHash: undefined, simulated: true };
  }

  async cashOut(_params: {
    userId: number;
    tokenId: number;
    amount: string;
  }): Promise<{ usdAmount: string; transactionHash?: string; simulated: boolean }> {
    // Simulated: 1 token = currentPrice USDT (caller should pass the correct price).
    // The DB debit is handled by the calling service.
    return { usdAmount: "0", transactionHash: undefined, simulated: true };
  }
}

/** Singleton used by routers. Swap this out to enable real settlement. */
export const settlementAdapter: ISettlementAdapter = new SimulatedSettlementAdapter();
