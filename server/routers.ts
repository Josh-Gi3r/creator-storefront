import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { settlementAdapter } from "./adapters/settlement/simulatedAdapter";
import * as db from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Fan-facing routes ──────────────────────────────────────────────────────
  fan: router({
    getCreators: publicProcedure
      .input(z.object({
        search: z.string().optional(),
        category: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllCreators({ search: input.search, category: input.category });
      }),

    getFeaturedCreators: publicProcedure.query(async () => {
      return await db.getAllCreators({ featured: true });
    }),

    getCreatorById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCreatorById(input.id);
      }),

    /** Single creator page — fetched by creatorId (user id). */
    getCreator: publicProcedure
      .input(z.object({ creatorId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCreatorById(input.creatorId);
      }),

    /** Services offered by a specific creator. */
    getCreatorServices: publicProcedure
      .input(z.object({ creatorId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCreatorServices(input.creatorId);
      }),

    /** Purchase creator tokens (simulated ledger buy). */
    buyTokens: protectedProcedure
      .input(z.object({
        creatorId: z.number(),
        amount: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const token = await db.getCreatorToken(input.creatorId);
        if (!token) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Creator token not found" });
        }
        await db.buyCreatorToken({
          buyerId: ctx.user.id,
          tokenId: token.id,
          amount: String(input.amount),
          pricePerToken: token.currentPrice,
        });
        return { success: true, tokenSymbol: token.tokenSymbol, amount: input.amount };
      }),

    /** Book a creator service. */
    bookService: protectedProcedure
      .input(z.object({
        serviceId: z.number(),
        scheduledAt: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const service = await db.getServiceById(input.serviceId);
        if (!service) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });
        }
        await db.createBooking({
          fanId: ctx.user.id,
          serviceId: input.serviceId,
          creatorId: service.creatorId,
          scheduledAt: new Date(input.scheduledAt),
          tokenAmount: String(service.tokenPrice),
          notes: input.notes,
        });
        return { success: true };
      }),
  }),

  // ── Creator dashboard routes ───────────────────────────────────────────────
  creator: router({
    /** Onboarding step 1: set up creator profile. */
    createProfile: protectedProcedure
      .input(z.object({
        bio: z.string().optional(),
        profilePhoto: z.string().optional(),
        category: z.string().optional(),
        twitterHandle: z.string().optional(),
        instagramHandle: z.string().optional(),
        website: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createCreatorProfile(ctx.user.id, {
          bio: input.bio ?? null,
          profilePhoto: input.profilePhoto ?? null,
          category: input.category ?? null,
          twitterHandle: input.twitterHandle ?? null,
          instagramHandle: input.instagramHandle ?? null,
          website: input.website ?? null,
        });
        // Promote user role to creator
        await db.updateUserRole(ctx.user.id, "creator");
        return { success: true };
      }),

    /** Onboarding step 2: launch a creator token. */
    launchToken: protectedProcedure
      .input(z.object({
        tokenName: z.string().min(1),
        tokenSymbol: z.string().min(1).max(10),
        initialPrice: z.union([z.string(), z.number()]).transform(v => String(v)),
      }))
      .mutation(async ({ input, ctx }) => {
        const deployResult = await settlementAdapter.deployToken({
          creatorId: ctx.user.id,
          tokenName: input.tokenName,
          tokenSymbol: input.tokenSymbol,
          initialSupply: "1000000",
          initialPriceUsd: input.initialPrice,
        });
        await db.createCreatorToken(ctx.user.id, {
          tokenName: input.tokenName,
          tokenSymbol: input.tokenSymbol,
          initialPrice: input.initialPrice,
          totalSupply: "1000000",
          contractAddress: deployResult.contractAddress ?? null,
          settlementListingId: deployResult.settlementListingId ?? null,
          liquidityPoolAddress: deployResult.liquidityPoolAddress ?? null,
        });
        return { success: true, simulated: deployResult.simulated };
      }),

    /** Creator's own profile. */
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreatorProfile(ctx.user.id);
    }),

    /** Creator's own token info. */
    getToken: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreatorToken(ctx.user.id);
    }),

    /** Services this creator offers. */
    getServices: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreatorServices(ctx.user.id);
    }),

    /** Bookings fans have made with this creator. */
    getBookings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreatorBookings(ctx.user.id);
    }),

    /** Aggregated stats for the creator dashboard. */
    getStats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCreatorStats(ctx.user.id);
    }),

    /** Add a new bookable service. */
    addService: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        tokenPrice: z.number().positive(),
        duration: z.number().int().positive(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createService(ctx.user.id, {
          title: input.title,
          description: input.description,
          tokenPrice: String(input.tokenPrice),
          duration: input.duration,
          category: input.category ?? null,
        });
        return { success: true };
      }),

    /** Accept / decline / complete / cancel a booking. */
    updateBookingStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(["accepted", "declined", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateBookingStatus(input.bookingId, input.status);
        return { success: true };
      }),

    /** Cash out all creator-held tokens back to simulated USDT balance. */
    cashout: protectedProcedure.mutation(async ({ ctx }) => {
      const token = await db.getCreatorToken(ctx.user.id);
      if (!token) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Creator token not found" });
      }
      const balance = await db.getCreatorTokenBalance(ctx.user.id, token.id);
      if (!balance || parseFloat(balance) === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No tokens to cash out" });
      }
      const result = await db.cashoutTokens({
        creatorId: ctx.user.id,
        tokenId: token.id,
        balance,
        pricePerToken: token.currentPrice,
      });
      return { success: true, usdAmount: result.usdAmount };
    }),
  }),

  // ── Fan wallet / portfolio routes ──────────────────────────────────────────
  wallet: router({
    /** All token holdings for the authenticated user. */
    getHoldings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTokenHoldings(ctx.user.id);
    }),

    /** Transaction history for the authenticated user. */
    getTransactions: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserTransactions(ctx.user.id);
    }),

    /** Bookings the authenticated user (as a fan) has made. */
    getBookings: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBookings(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
