/**
 * Settlement / on-chain issuance adapter interface.
 *
 * The token economy in this template is DB-simulated by default — balances
 * live in the `token_holdings` and `transactions` tables, no blockchain
 * interaction occurs. This seam is where you wire in real settlement when
 * ready (Phase 8 in the original roadmap).
 *
 * Schema hints (drizzle/schema.ts):
 *   - creatorTokens.contractAddress   — ERC-20 contract once deployed
 *   - creatorTokens.settlementListingId — external DEX/liquidity listing ID
 *   - creatorTokens.liquidityPoolAddress — AMM pool address
 *   - bookings.transactionHash        — on-chain settlement tx
 *   - transactions.transactionHash    — on-chain settlement tx
 *
 * Default: SimulatedSettlementAdapter (DB-only, no web3).
 * Optional alternatives:
 *   - ERC-20 factory + Uniswap V3 (Ethereum / Base / Arbitrum)
 *   - Any DEX with an API (e.g. ERC-20 factory, Uniswap V3)
 *   - Stablecoin payment rails (USDC Circle, USDT Tron)
 */

export interface TokenDeployParams {
  creatorId: number;
  tokenName: string;
  tokenSymbol: string;
  initialSupply: string;
  initialPriceUsd: string;
}

export interface TokenDeployResult {
  contractAddress?: string;
  settlementListingId?: string;
  liquidityPoolAddress?: string;
  transactionHash?: string;
  /** If simulated=true, no on-chain action was taken */
  simulated: boolean;
}

export interface TransferParams {
  fromUserId: number;
  toUserId: number;
  tokenId: number;
  amount: string;
}

export interface TransferResult {
  transactionHash?: string;
  simulated: boolean;
}

export interface ISettlementAdapter {
  /**
   * Deploy a new creator token. In simulated mode this is a no-op that
   * returns empty on-chain fields.
   */
  deployToken(params: TokenDeployParams): Promise<TokenDeployResult>;

  /**
   * Transfer tokens between users. In simulated mode this only needs
   * to return a result — the DB write is handled by the calling service.
   */
  transfer(params: TransferParams): Promise<TransferResult>;

  /**
   * Cash out (sell) tokens back to the pool. Returns the USD amount
   * received and a transaction hash (or undefined if simulated).
   */
  cashOut(params: {
    userId: number;
    tokenId: number;
    amount: string;
  }): Promise<{ usdAmount: string; transactionHash?: string; simulated: boolean }>;
}
