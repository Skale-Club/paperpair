import { createClient } from "@/lib/supabase/server";
import {
  verifyAuthenticationResponse
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
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

  const body = await request.json();
  const { origin, rpID } = getHostParts(request);

  const credentialIDBase64 = body?.id as string | undefined;
  if (!credentialIDBase64) {
    return NextResponse.json({ error: "Missing credential id" }, { status: 400 });
  }

  const { data: challengeRow } = await supabase
    .from("webauthn_challenges")
    .select("challenge")
    .eq("user_id", user.id)
    .eq("purpose", "authentication")
    .single();

  if (!challengeRow) {
    return NextResponse.json({ error: "No challenge found" }, { status: 400 });
  }

  const { data: credential } = await supabase
    .from("webauthn_credentials")
    .select("credential_id, public_key, counter")
    .eq("credential_id", credentialIDBase64)
    .eq("user_id", user.id)
    .single();

  if (!credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 400 });
  }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.credential_id,
      publicKey: isoBase64URL.toBuffer(credential.public_key),
      counter: Number(credential.counter)
    }
  });

  if (!verification.verified) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const newCounter = verification.authenticationInfo.newCounter;
  await supabase
    .from("webauthn_credentials")
    .update({ counter: newCounter })
    .eq("credential_id", credential.credential_id)
    .eq("user_id", user.id);

  await supabase
    .from("webauthn_challenges")
    .delete()
    .eq("user_id", user.id)
    .eq("purpose", "authentication");

  return NextResponse.json({ verified: true });
}
