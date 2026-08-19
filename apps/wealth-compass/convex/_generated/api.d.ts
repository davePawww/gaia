/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_sendPush from "../actions/sendPush.js";
import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as categories from "../categories.js";
import type * as constants from "../constants.js";
import type * as cronJobs from "../cronJobs.js";
import type * as crons from "../crons.js";
import type * as email from "../email.js";
import type * as emailContent from "../emailContent.js";
import type * as exchangeRates from "../exchangeRates.js";
import type * as finance from "../finance.js";
import type * as goals from "../goals.js";
import type * as http from "../http.js";
import type * as insights from "../insights.js";
import type * as jars from "../jars.js";
import type * as notifications from "../notifications.js";
import type * as recurring from "../recurring.js";
import type * as recurringIncomes from "../recurringIncomes.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/sendPush": typeof actions_sendPush;
  ai: typeof ai;
  auth: typeof auth;
  categories: typeof categories;
  constants: typeof constants;
  cronJobs: typeof cronJobs;
  crons: typeof crons;
  email: typeof email;
  emailContent: typeof emailContent;
  exchangeRates: typeof exchangeRates;
  finance: typeof finance;
  goals: typeof goals;
  http: typeof http;
  insights: typeof insights;
  jars: typeof jars;
  notifications: typeof notifications;
  recurring: typeof recurring;
  recurringIncomes: typeof recurringIncomes;
  transactions: typeof transactions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
