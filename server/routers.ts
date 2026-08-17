import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { kabaRouter } from "./routers/kaba";
import { getKabaCollections } from "./mongodbCollections";
import { hashPassword, verifyPassword } from "./localAuth";
import { upsertUser } from "./db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  kaba: kabaRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    localLogin: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(8).max(200) })).mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const { users } = await getKabaCollections();
      const account = await users.findOne({ email });
      if (!account?.passwordHash || !(await verifyPassword(input.password, account.passwordHash))) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect." });
      }
      const openId = account.openId || `local:${email}`;
      const displayName = account.name || email.split("@")[0];
      await upsertUser({ openId, email, name: displayName, loginMethod: "local", role: account.role === "admin" ? "admin" : "user", lastSignedIn: new Date() });
      const token = await sdk.signSession({ openId, appId: ENV.appId, name: displayName });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 30 });
      return { success: true, needsProfile: account.needsProfile !== false, role: account.role ?? "user" } as const;
    }),
    localRegister: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(8).max(200), name: z.string().trim().min(2).max(120), profile: z.enum(["Agent immobilier", "Courtier"]), phone: z.string().trim().max(30).optional(), city: z.string().trim().max(100).optional(), rcNumber: z.string().trim().max(80).optional(), ninea: z.string().trim().max(80).optional(), agencyAddress: z.string().trim().max(180).optional() })).mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const { users } = await getKabaCollections();
      const existing = await users.findOne({ email }, { projection: { _id: 1 } });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Un compte existe déjà avec cet email." });
      const now = new Date();
      const openId = `local:${email}`;
      await users.insertOne({ openId, email, name: input.name, profile: input.profile, phone: input.phone, city: input.city, rcNumber: input.rcNumber, ninea: input.ninea, agencyAddress: input.agencyAddress, passwordHash: await hashPassword(input.password), role: "user", needsProfile: false, createdAt: now, updatedAt: now });
      await upsertUser({ openId, email, name: input.name, loginMethod: "local", role: "user", lastSignedIn: now });
      const token = await sdk.signSession({ openId, appId: ENV.appId, name: input.name });
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: 1000 * 60 * 60 * 24 * 30 });
      return { success: true, needsProfile: false, role: "user" as const };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
