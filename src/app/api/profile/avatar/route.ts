import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        if (!ALLOWED.has(file.type)) {
            return NextResponse.json(
                { error: "Only JPG, PNG, or WebP images are allowed." },
                { status: 400 }
            );
        }

        if (file.size <= 0 || file.size > MAX_BYTES) {
            return NextResponse.json(
                { error: "Image must be 5 MB or less." },
                { status: 400 }
            );
        }

        const ext = file.name.split(".").pop() ?? "jpg";
        const storagePath = `avatars/${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("user-documents")
            .upload(storagePath, file, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            return NextResponse.json(
                { error: "Upload failed", details: uploadError.message },
                { status: 500 }
            );
        }

        const {
            data: { publicUrl }
        } = supabase.storage.from("user-documents").getPublicUrl(storagePath);

        await prisma.userProfile.update({
            where: { authId: user.id },
            data: { avatarUrl: publicUrl }
        });

        await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });

        return NextResponse.json({ success: true, avatarUrl: publicUrl });
    } catch (err) {
        console.error("[api/profile/avatar]", err);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
