// app/api/convex/upload/route.ts
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  try {
    const uploadUrl = await convex.action("files:generateUploadUrl");
    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error("Upload URL generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
