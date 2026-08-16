import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import Google from "@auth/core/providers/google";
import type { EmailProviderSendVerificationRequestParams } from "@auth/core/providers/email";
import type {
  EmailConfig,
  GenericActionCtxWithAuthConfig,
} from "@convex-dev/auth/server";
import type { DataModel } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { DEFAULT_JARS, DEFAULT_CATEGORIES } from "./constants";

function createEmailProvider(
  kind: "password-reset" | "email-verification",
) {
  // Convex Auth passes its action context as a second runtime argument even
  // though the Auth.js callback type only declares the first argument.
  const sendVerificationRequest = (async (
    { identifier, url, expires }: EmailProviderSendVerificationRequestParams,
    ctx: GenericActionCtxWithAuthConfig<DataModel>,
  ) => {
    await ctx.runAction(internal.email.sendVerificationEmail, {
      identifier,
      url,
      expiresAt: expires.getTime(),
      kind,
    });
  }) as unknown as EmailConfig["sendVerificationRequest"];

  return Email({
    maxAge: 60 * 60,
    sendVerificationRequest,
  });
}

const passwordResetEmailProvider = createEmailProvider("password-reset");
const emailVerificationProvider = createEmailProvider("email-verification");

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          name: params.name as string,
          email: params.email as string,
        };
      },
      reset: passwordResetEmailProvider,
      verify: emailVerificationProvider,
    }),
    emailVerificationProvider,
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
            name: jar.name,
            color: jar.color,
            percentage: jar.percentage,
            icon: jar.icon,
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
