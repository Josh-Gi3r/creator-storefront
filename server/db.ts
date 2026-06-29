import { eq, and, desc, like, or, sql, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  creatorProfiles,
  InsertCreatorProfile,
  creatorTokens,
  InsertCreatorToken,
  services,
  InsertService,
  bookings,
  tokenHoldings,
  transactions
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "walletAddress"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCreatorProfile(userId: number, data: Omit<InsertCreatorProfile, 'userId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(creatorProfiles).values({
    userId,
    ...data,
  });

  return result;
}

export async function getCreatorProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(creatorProfiles).where(eq(creatorProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCreatorToken(creatorId: number, data: Omit<InsertCreatorToken, 'creatorId' | 'currentPrice'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(creatorTokens).values({
    creatorId,
    currentPrice: data.initialPrice,
    ...data,
  });

  return result;
}

export async function getCreatorToken(creatorId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(creatorTokens).where(eq(creatorTokens.creatorId, creatorId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(userId: number, role: 'user' | 'admin' | 'creator' | 'fan') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function createService(creatorId: number, data: Omit<InsertService, 'creatorId'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(services).values({
    creatorId,
    ...data,
  });

  return result;
}

export async function getCreatorServices(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(services).where(eq(services.creatorId, creatorId)).orderBy(desc(services.createdAt));
  return result;
}

export async function getCreatorBookings(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      booking: bookings,
      service: services,
      fan: users,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(users, eq(bookings.fanId, users.id))
    .where(eq(bookings.creatorId, creatorId))
    .orderBy(desc(bookings.createdAt));

  return result.map(r => ({
    ...r.booking,
    service: r.service,
    fan: r.fan,
  }));
}

export async function updateBookingStatus(bookingId: number, status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId));
}

export async function getCreatorTokenBalance(creatorId: number, tokenId: number) {
  const db = await getDb();
  if (!db) return "0";

  const result = await db
    .select()
    .from(tokenHoldings)
    .where(and(eq(tokenHoldings.userId, creatorId), eq(tokenHoldings.tokenId, tokenId)))
    .limit(1);

  return result.length > 0 ? result[0].balance : "0";
}

export async function getAllCreators(options?: { search?: string; category?: string; featured?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      user: users,
      profile: creatorProfiles,
      token: creatorTokens,
    })
    .from(users)
    .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
    .leftJoin(creatorTokens, eq(users.id, creatorTokens.creatorId))
    .where(eq(users.role, "creator"));

  // Apply filters
  const conditions = [eq(users.role, "creator")];

  if (options?.search) {
    conditions.push(
      or(
        like(users.name, `%${options.search}%`),
        like(creatorProfiles.bio, `%${options.search}%`),
        like(creatorProfiles.category, `%${options.search}%`)
      )!
    );
  }

  if (options?.category) {
    conditions.push(eq(creatorProfiles.category, options.category));
  }

  if (options?.featured) {
    conditions.push(eq(creatorProfiles.featured, true));
  }

  const result = await db
    .select({
      user: users,
      profile: creatorProfiles,
      token: creatorTokens,
    })
    .from(users)
    .innerJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
    .leftJoin(creatorTokens, eq(users.id, creatorTokens.creatorId))
    .where(and(...conditions))
    .orderBy(desc(creatorProfiles.featured), desc(creatorProfiles.totalBookings));

  return result.map(r => ({
    ...r.user,
    profile: r.profile,
    token: r.token,
  }));
}

export async function getCreatorById(creatorId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      user: users,
      profile: creatorProfiles,
      token: creatorTokens,
    })
    .from(users)
    .leftJoin(creatorProfiles, eq(users.id, creatorProfiles.userId))
    .leftJoin(creatorTokens, eq(users.id, creatorTokens.creatorId))
    .where(eq(users.id, creatorId))
    .limit(1);

  if (result.length === 0) return undefined;

  return {
    ...result[0].user,
    profile: result[0].profile,
    token: result[0].token,
  };
}

export async function getServiceById(serviceId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(services).where(eq(services.id, serviceId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserTokenHoldings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      holding: tokenHoldings,
      token: creatorTokens,
      creator: users,
    })
    .from(tokenHoldings)
    .innerJoin(creatorTokens, eq(tokenHoldings.tokenId, creatorTokens.id))
    .innerJoin(users, eq(creatorTokens.creatorId, users.id))
    .where(eq(tokenHoldings.userId, userId))
    .orderBy(desc(tokenHoldings.updatedAt));

  return result.map(r => ({
    ...r.holding,
    token: r.token,
    creator: r.creator,
  }));
}

export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      transaction: transactions,
      token: creatorTokens,
    })
    .from(transactions)
    .leftJoin(creatorTokens, eq(transactions.tokenId, creatorTokens.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt));

  return result.map(r => ({
    ...r.transaction,
    token: r.token,
  }));
}

export async function getUserBookings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      booking: bookings,
      service: services,
      creator: users,
    })
    .from(bookings)
    .leftJoin(services, eq(bookings.serviceId, services.id))
    .leftJoin(users, eq(bookings.creatorId, users.id))
    .where(eq(bookings.fanId, userId))
    .orderBy(desc(bookings.createdAt));

  return result.map(r => ({
    ...r.booking,
    service: r.service,
    creator: r.creator,
  }));
}

/**
 * Buy tokens from a creator's token pool (simulated — DB ledger only).
 * Creates/updates a tokenHolding row and writes a transaction record.
 */
export async function buyCreatorToken(params: {
  buyerId: number;
  tokenId: number;
  amount: string;
  pricePerToken: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalValue = (parseFloat(params.amount) * parseFloat(params.pricePerToken)).toFixed(6);

  // Upsert token holding
  const existing = await db
    .select()
    .from(tokenHoldings)
    .where(and(eq(tokenHoldings.userId, params.buyerId), eq(tokenHoldings.tokenId, params.tokenId)))
    .limit(1);

  if (existing.length > 0) {
    const newBalance = (parseFloat(existing[0].balance) + parseFloat(params.amount)).toFixed(6);
    const newInvested = (parseFloat(existing[0].totalInvested ?? "0") + parseFloat(totalValue)).toFixed(6);
    const newSpent = (parseFloat(existing[0].totalSpent ?? "0") + parseFloat(totalValue)).toFixed(6);
    await db.update(tokenHoldings)
      .set({
        balance: newBalance,
        totalInvested: newInvested,
        totalSpent: newSpent,
        averageBuyPrice: params.pricePerToken,
      })
      .where(eq(tokenHoldings.id, existing[0].id));
  } else {
    await db.insert(tokenHoldings).values({
      userId: params.buyerId,
      tokenId: params.tokenId,
      balance: params.amount,
      averageBuyPrice: params.pricePerToken,
      totalInvested: totalValue,
      totalSpent: totalValue,
    });
  }

  // Write transaction record
  await db.insert(transactions).values({
    userId: params.buyerId,
    tokenId: params.tokenId,
    type: "buy",
    amount: params.amount,
    pricePerToken: params.pricePerToken,
    totalValue,
    status: "completed",
  });

  // Update circulating supply
  await db
    .update(creatorTokens)
    .set({
      circulatingSupply: sql`${creatorTokens.circulatingSupply} + ${params.amount}`,
    })
    .where(eq(creatorTokens.id, params.tokenId));
}

/**
 * Create a service booking (simulated — no on-chain action).
 */
export async function createBooking(params: {
  fanId: number;
  serviceId: number;
  creatorId: number;
  scheduledAt: Date;
  tokenAmount: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(bookings).values({
    fanId: params.fanId,
    serviceId: params.serviceId,
    creatorId: params.creatorId,
    scheduledAt: params.scheduledAt,
    tokenAmount: params.tokenAmount,
    notes: params.notes ?? null,
    status: "pending",
  });

  // Increment service booking count
  await db
    .update(services)
    .set({ totalBookings: sql`${services.totalBookings} + 1` })
    .where(eq(services.id, params.serviceId));
}

/**
 * Cash out (sell back) all creator-owned tokens — simulated, DB-only.
 * Debits the creator's holding and writes a cashout transaction.
 */
export async function cashoutTokens(params: {
  creatorId: number;
  tokenId: number;
  balance: string;
  pricePerToken: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalValue = (parseFloat(params.balance) * parseFloat(params.pricePerToken)).toFixed(6);

  // Zero out the holding
  await db
    .update(tokenHoldings)
    .set({ balance: "0", totalInvested: "0" })
    .where(
      and(
        eq(tokenHoldings.userId, params.creatorId),
        eq(tokenHoldings.tokenId, params.tokenId)
      )
    );

  // Write cashout transaction
  await db.insert(transactions).values({
    userId: params.creatorId,
    tokenId: params.tokenId,
    type: "cashout",
    amount: params.balance,
    pricePerToken: params.pricePerToken,
    totalValue,
    status: "completed",
  });

  return { usdAmount: totalValue };
}

/**
 * Aggregate stats for a creator's dashboard.
 */
export async function getCreatorStats(creatorId: number) {
  const db = await getDb();
  if (!db) {
    return { tokenBalance: "0", totalRevenue: "0", totalBookings: 0, totalFans: 0 };
  }

  // Get creator's token
  const token = await getCreatorToken(creatorId);

  // Token balance held by the creator themselves
  let tokenBalance = "0";
  if (token) {
    tokenBalance = await getCreatorTokenBalance(creatorId, token.id);
  }

  // Total revenue = sum of completed cashout transactions
  const revenueResult = await db
    .select({ total: sql<string>`COALESCE(SUM(${transactions.totalValue}), '0')` })
    .from(transactions)
    .where(and(eq(transactions.userId, creatorId), eq(transactions.type, "cashout")));
  const totalRevenue = revenueResult[0]?.total ?? "0";

  // Total bookings
  const bookingResult = await db
    .select({ total: sql<number>`COUNT(*)` })
    .from(bookings)
    .where(eq(bookings.creatorId, creatorId));
  const totalBookings = Number(bookingResult[0]?.total ?? 0);

  // Unique fans (distinct fanIds who have booked)
  const fanResult = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${bookings.fanId})` })
    .from(bookings)
    .where(eq(bookings.creatorId, creatorId));
  const totalFans = Number(fanResult[0]?.total ?? 0);

  return { tokenBalance, totalRevenue, totalBookings, totalFans };
}
