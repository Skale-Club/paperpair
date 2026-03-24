import { createClient } from "@/lib/supabase/server";
import {
  generateRegistrationOptions
} from "@simplewebauthn/server";
import { NextResponse } from "next/server";

function getHostParts(request: Request) {
  const host = request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;
  const rpID = host.split(":")[0];
  return { origin, rpID };
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { origin, rpID } = getHostParts(request);

  const { data: existingCreds } = await supabase
    .from("webauthn_credentials")
    .select("credential_id")
    .eq("user_id", user.id);

  const options = await generateRegistrationOptions({
    rpName: "PaperPair",
    rpID,
    userID: new TextEncoder().encode(user.id),
    userName: user.email ?? "user",
    timeout: 60_000,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred"
    },
    excludeCredentials:
      existingCreds?.map((cred) => ({
        id: cred.credential_id,
        type: "public-key" as const
      })) ?? [],
    supportedAlgorithmIDs: [-7, -257]
  });

  await supabase
    .from("webauthn_challenges")
    .upsert({
      user_id: user.id,
      purpose: "registration",
      challenge: options.challenge
    });

  return NextResponse.json({ options, origin, rpID });
}
