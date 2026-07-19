import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import type { DataModel } from "./_generated/dataModel";
import { DEFAULT_JARS, DEFAULT_CATEGORIES } from "./constants";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          name: params.name as string,
          email: params.email as string,
        };
      },
    }),
    Google,
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { userId }) {
      const existingJars = await ctx.db
        .query("jars")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (!existingJars) {
        for (const jar of DEFAULT_JARS) {
          await ctx.db.insert("jars", {
            userId,
            ...jar,
          });
        }
      }

      const existingCategories = await ctx.db
        .query("categories")
        .filter((q) => q.eq(q.field("userId"), userId))
        .first();

      if (!existingCategories) {
        for (const [jarName, categoryNames] of Object.entries(DEFAULT_CATEGORIES)) {
          for (const name of categoryNames) {
            await ctx.db.insert("categories", {
              userId,
              jarName,
              name,
            });
          }
        }
      }
    },
  },
});
