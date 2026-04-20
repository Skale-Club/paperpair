import { createClient } from "@/lib/supabase/server";
import {
  generateAuthenticationOptions
} from "@simplewebauthn/server";
import { NextResponse } from "next/server";

function getHostParts(request: Request) {
  const host = request.headers.get("host") ?? "localhost:6778";
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = `${proto}://${host}`;
  const rpID = host.split(":")[0];
  return { origin, rpID };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rpID } = getHostParts(request);

  const { data: credentials } = await supabase
    .from("webauthn_credentials")
    .select("credential_id, transports")
    .eq("user_id", user.id);

  if (!credentials || credentials.length === 0) {
    return NextResponse.json({ error: "No passkeys registered" }, { status: 400 });
  }

  const options = await generateAuthenticationOptions({
    rpID,
    timeout: 60_000,
    userVerification: "preferred",
    allowCredentials: credentials.map((cred) => ({
      id: cred.credential_id,
      type: "public-key" as const,
      transports: cred.transports ?? undefined
    }))
  });

  await supabase
    .from("webauthn_challenges")
    .upsert({
      user_id: user.id,
      purpose: "authentication",
      challenge: options.challenge
    });

  return NextResponse.json({ options });
}
