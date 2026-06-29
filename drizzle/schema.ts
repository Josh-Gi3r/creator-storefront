/**
 * Database schema — MySQL dialect (Drizzle ORM).
 *
 * POSTGRES NOTE: To switch to PostgreSQL, replace all drizzle-orm/mysql-core
 * imports with drizzle-orm/pg-core equivalents:
 *   - mysqlTable      → pgTable
 *   - mysqlEnum       → pgEnum (defined separately, referenced in table)
 *   - int             → integer
 *   - varchar         → varchar (same)
 *   - decimal         → decimal (same)
 *   - boolean         → boolean (same)
 *   - text            → text (same)
 *   - timestamp       → timestamp (same, but remove .onUpdateNow(); use triggers instead)
 * And update drizzle.config.ts: dialect: "postgresql", driver: "pg".
 *
 * SETTLEMENT SEAM: Fields marked [settlement] are populated by
 * server/adapters/settlement/interface.ts implementations.
 * Default (SimulatedSettlementAdapter) leaves them null — no on-chain action.
 * Wire in a real adapter to populate them during token deploy / transfer / cashout.
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
} from "drizzle-orm/mysql-core";

/** Core user table backing the auth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "creator", "fan"])
    .default("fan")
    .notNull(),
  walletAddress: varchar("walletAddress", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** Creator profiles with extended information. */
export const creatorProfiles = mysqlTable("creator_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  profilePhoto: text("profilePhoto"),
  coverPhoto: text("coverPhoto"),
  twitterHandle: varchar("twitterHandle", { length: 255 }),
  instagramHandle: varchar("instagramHandle", { length: 255 }),
  youtubeChannel: varchar("youtubeChannel", { length: 255 }),
  discordServer: varchar("discordServer", { length: 255 }),
  website: varchar("website", { length: 500 }),
  category: varchar("category", { length: 100 }),
  featured: boolean("featured").default(false).notNull(),
  verified: boolean("verified").default(false).notNull(),
  followerCount: int("followerCount").default(0).notNull(),
  totalBookings: int("totalBookings").default(0).notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Creator tokens — DB-simulated currency ledger (default).
 *
 * [settlement] fields are populated by ISettlementAdapter when on-chain
 * settlement is enabled (see server/adapters/settlement/).
 * They are all nullable and ignored in simulated mode.
 */
export const creatorTokens = mysqlTable("creator_tokens", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenName: varchar("tokenName", { length: 100 }).notNull(),
  tokenSymbol: varchar("tokenSymbol", { length: 10 }).notNull(),
  /** [settlement] ERC-20 contract address once deployed on-chain */
  contractAddress: varchar("contractAddress", { length: 128 }),
  initialPrice: decimal("initialPrice", { precision: 18, scale: 6 }).notNull(),
  currentPrice: decimal("currentPrice", { precision: 18, scale: 6 }).notNull(),
  totalSupply: decimal("totalSupply", { precision: 30, scale: 0 }).default("0"),
  circulatingSupply: decimal("circulatingSupply", { precision: 30, scale: 0 }).default("0"),
  /** [settlement] AMM / DEX liquidity pool address */
  liquidityPoolAddress: varchar("liquidityPoolAddress", { length: 128 }),
  /** [settlement] External listing ID from the settlement provider */
  settlementListingId: varchar("settlementListingId", { length: 100 }),
  /** [settlement] Timestamp of on-chain deployment */
  deployedAt: timestamp("deployedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Services offered by creators (bookable via fan storefronts). */
export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  tokenPrice: decimal("tokenPrice", { precision: 18, scale: 6 }).notNull(),
  duration: int("duration").notNull(), // in minutes
  availability: text("availability"), // JSON string for availability slots
  isActive: boolean("isActive").default(true).notNull(),
  category: varchar("category", { length: 100 }),
  imageUrl: text("imageUrl"),
  maxBookingsPerDay: int("maxBookingsPerDay"),
  totalBookings: int("totalBookings").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Service bookings (fan → creator). */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  serviceId: int("serviceId")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  fanId: int("fanId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creatorId: int("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "accepted",
    "declined",
    "completed",
    "cancelled",
  ])
    .default("pending")
    .notNull(),
  tokenAmount: decimal("tokenAmount", { precision: 18, scale: 6 }).notNull(),
  /** [settlement] On-chain transaction hash if settled on-chain */
  transactionHash: varchar("transactionHash", { length: 128 }),
  notes: text("notes"),
  meetingLink: text("meetingLink"),
  calendarEventId: varchar("calendarEventId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Token transactions (buy / sell / transfer / payment / cashout). */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenId: int("tokenId")
    .notNull()
    .references(() => creatorTokens.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", [
    "buy",
    "sell",
    "transfer",
    "payment",
    "cashout",
  ]).notNull(),
  amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
  pricePerToken: decimal("pricePerToken", { precision: 18, scale: 6 }),
  totalValue: decimal("totalValue", { precision: 18, scale: 6 }),
  fromAddress: varchar("fromAddress", { length: 128 }),
  toAddress: varchar("toAddress", { length: 128 }),
  /** [settlement] On-chain transaction hash */
  transactionHash: varchar("transactionHash", { length: 128 }),
  status: mysqlEnum("status", ["pending", "completed", "failed"])
    .default("pending")
    .notNull(),
  metadata: text("metadata"), // JSON for additional info
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Token balances per user per creator token. */
export const tokenHoldings = mysqlTable("token_holdings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenId: int("tokenId")
    .notNull()
    .references(() => creatorTokens.id, { onDelete: "cascade" }),
  balance: decimal("balance", { precision: 30, scale: 6 }).default("0").notNull(),
  averageBuyPrice: decimal("averageBuyPrice", { precision: 18, scale: 6 }),
  totalInvested: decimal("totalInvested", { precision: 18, scale: 6 }).default("0"),
  totalSpent: decimal("totalSpent", { precision: 18, scale: 6 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Liquidity pool snapshots.
 * [settlement] Populated by the settlement adapter when on-chain pools exist.
 * In simulated mode these rows are unused (balances live in tokenHoldings).
 */
export const liquidityPools = mysqlTable("liquidity_pools", {
  id: int("id").autoincrement().primaryKey(),
  tokenId: int("tokenId")
    .notNull()
    .references(() => creatorTokens.id, { onDelete: "cascade" }),
  poolAddress: varchar("poolAddress", { length: 128 }),
  tokenReserve: decimal("tokenReserve", { precision: 30, scale: 6 }).default("0"),
  usdtReserve: decimal("usdtReserve", { precision: 30, scale: 6 }).default("0"),
  totalLiquidity: decimal("totalLiquidity", { precision: 30, scale: 6 }).default("0"),
  volume24h: decimal("volume24h", { precision: 30, scale: 6 }).default("0"),
  fees24h: decimal("fees24h", { precision: 30, scale: 6 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Daily analytics snapshots per creator. */
export const creatorAnalytics = mysqlTable("creator_analytics", {
  id: int("id").autoincrement().primaryKey(),
  creatorId: int("creatorId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  tokensSold: decimal("tokensSold", { precision: 30, scale: 6 }).default("0"),
  revenue: decimal("revenue", { precision: 18, scale: 6 }).default("0"),
  bookingsCount: int("bookingsCount").default(0),
  newFans: int("newFans").default(0),
  tokenVelocity: decimal("tokenVelocity", { precision: 10, scale: 4 }).default("0"),
  avgTransactionSize: decimal("avgTransactionSize", { precision: 18, scale: 6 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Type exports ────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = typeof creatorProfiles.$inferInsert;
export type CreatorToken = typeof creatorTokens.$inferSelect;
export type InsertCreatorToken = typeof creatorTokens.$inferInsert;
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type TokenHolding = typeof tokenHoldings.$inferSelect;
export type InsertTokenHolding = typeof tokenHoldings.$inferInsert;
export type LiquidityPool = typeof liquidityPools.$inferSelect;
export type InsertLiquidityPool = typeof liquidityPools.$inferInsert;
export type CreatorAnalytic = typeof creatorAnalytics.$inferSelect;
export type InsertCreatorAnalytic = typeof creatorAnalytics.$inferInsert;
