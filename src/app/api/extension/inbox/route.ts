import { takeSavedJobs } from "@/lib/extension-inbox";
import { extensionSecret, readExtensionToken } from "@/lib/extension-token";
import { isRevoked } from "@/lib/extension-inbox";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { token?: string };
  const session = readExtensionToken(body.token || "", extensionSecret());
  if (!session || isRevoked(body.token || "")) {
    return NextResponse.json({ error: "Pair the extension again in Settings." }, { status: 401 });
  }
  return NextResponse.json({ jobs: takeSavedJobs(session.sub) });
}
