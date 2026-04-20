import { createClient } from "@/lib/supabase/server";
import {
  verifyRegistrationResponse
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

  const { data: challengeRow } = await supabase
    .from("webauthn_challenges")
    .select("challenge")
    .eq("user_id", user.id)
    .eq("purpose", "registration")
    .single();

  if (!challengeRow) {
    return NextResponse.json({ error: "No challenge found" }, { status: 400 });
  }

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge: challengeRow.challenge,
    expectedOrigin: origin,
    expectedRPID: rpID
  });

  const { verified, registrationInfo } = verification;

  if (!verified || !registrationInfo) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const {
    credential,
    credentialDeviceType,
    credentialBackedUp
  } = registrationInfo;

  const {
    id: credentialID,
    publicKey: credentialPublicKey,
    counter
  } = credential;

  const transports = body?.response?.transports ?? null;

  await supabase.from("webauthn_credentials").upsert({
    user_id: user.id,
    credential_id: credentialID,
    public_key: isoBase64URL.fromBuffer(credentialPublicKey),
    counter,
    device_type: credentialDeviceType,
    backed_up: credentialBackedUp,
    transports
  });

  await supabase
    .from("webauthn_challenges")
    .delete()
    .eq("user_id", user.id)
    .eq("purpose", "registration");

  return NextResponse.json({ verified: true });
}
