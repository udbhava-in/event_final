// convex/files.ts
import { action } from "./_generated/server";

export const generateUploadUrl = action(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});