import { extensionSecret, signExtensionToken } from "@/lib/extension-token";
import { userFromAuthHeader } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = extensionSecret();
  if (!secret) {
    return NextResponse.json({ error: "Set EXTENSION_TOKEN_SECRET before pairing an extension." }, { status: 503 });
  }
  const session = await userFromAuthHeader(request);
  const subject = session?.user.id ?? "demo";
  return NextResponse.json({ token: signExtensionToken(subject, secret), subject });
}
