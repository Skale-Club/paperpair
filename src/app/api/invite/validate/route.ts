import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const invite = await prisma.spouseInvite.findUnique({
    where: { token },
    include: { primaryUser: { select: { fullName: true, email: true } } },
  });

  if (!invite) {
    return NextResponse.json({ status: "invalid" });
  }

  if (invite.accepted) {
    return NextResponse.json({ status: "accepted" });
  }

  if (new Date() > invite.expiresAt) {
    return NextResponse.json({ status: "expired" });
  }

  return NextResponse.json({
    status: "valid",
    petitionerName: invite.primaryUser.fullName ?? invite.primaryUser.email,
    spouseEmail: invite.spouseEmail,
  });
}
