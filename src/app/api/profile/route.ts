import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const profile = await prisma.userProfile.findUnique({ where: { authId: user.id } });
        return NextResponse.json({
            fullName: profile?.fullName ?? null,
            email: profile?.email ?? user.email ?? "",
            avatarUrl: profile?.avatarUrl ?? null
        });
    } catch (err) {
        console.error("[api/profile GET]", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json() as { fullName?: unknown; password?: unknown };
        const { fullName, password } = body;

        if (fullName === undefined && password === undefined) {
            return NextResponse.json({ error: "Provide at least one field to update" }, { status: 400 });
        }

        if (fullName !== undefined && (typeof fullName !== "string" || fullName.trim().length === 0 || fullName.length > 100)) {
            return NextResponse.json({ error: "Full name must be 1–100 characters" }, { status: 400 });
        }

        if (password !== undefined && (typeof password !== "string" || password.length < 8 || password.length > 72)) {
            return NextResponse.json({ error: "Password must be 8–72 characters" }, { status: 400 });
        }

        const updates: { data?: { full_name: string }; password?: string } = {};
        if (typeof fullName === "string") updates.data = { full_name: fullName.trim() };
        if (typeof password === "string") updates.password = password;

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase.auth.updateUser(updates);
            if (updateError) {
                return NextResponse.json({ error: updateError.message }, { status: 400 });
            }
        }

        if (typeof fullName === "string") {
            await prisma.userProfile.update({
                where: { authId: user.id },
                data: { fullName: fullName.trim() }
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("[api/profile] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
