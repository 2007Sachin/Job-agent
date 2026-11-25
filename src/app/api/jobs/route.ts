import { firebaseAdminConfigured } from "@/lib/firebase/server";
import { searchJobs } from "@/lib/job-search";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = await searchJobs({
    q: searchParams.get("q") ?? "",
    location: searchParams.get("location") ?? "",
    demo: !firebaseAdminConfigured(),
  });
  return NextResponse.json(result);
}
