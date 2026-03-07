import { type Prisma, Role } from "@prisma/client";
import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type UserProfileWithCaseSteps = Prisma.UserProfileGetPayload<{
  include: { caseSteps: true };
}>;

type UserWithEmail = User & { email: string };

function getRoleFromUser(user: User): Role {
  const role = (user.app_metadata as { role?: string } | null)?.role;
  return role === "admin" ? Role.ADMIN : Role.USER;
}

function getStringMetadata(user: User, key: string): string | null {
  const value = user.user_metadata?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

async function getCurrentUser(): Promise<UserWithEmail | null> {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return null;
  }

  return user as UserWithEmail;
}

export async function getCurrentUserAndProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  let userProfile;
  try {
    userProfile = await prisma.userProfile.upsert({
      where: { authId: user.id },
      create: {
        authId: user.id,
        email: user.email,
        fullName: getStringMetadata(user, "full_name"),
        avatarUrl: getStringMetadata(user, "avatar_url"),
        role: getRoleFromUser(user)
      },
      update: {
        email: user.email,
        fullName: getStringMetadata(user, "full_name"),
        avatarUrl: getStringMetadata(user, "avatar_url"),
        role: getRoleFromUser(user)
      }
    });
  } catch {
    return null;
  }

  return { user, userProfile };
}

export async function getCurrentUserAndProfileWithViewerSupport() {
  const context = await getCurrentUserAndProfileWithCaseSteps();
  if (!context) return null;

  const { user, userProfile } = context;

  if (userProfile.viewerOfId) {
    const primaryProfile = await prisma.userProfile.findUnique({
      where: { id: userProfile.viewerOfId },
      include: { caseSteps: true },
    });
    return { user, userProfile, isViewer: true as const, primaryProfile };
  }

  return { user, userProfile, isViewer: false as const, primaryProfile: null };
}

export async function getCurrentUserAndProfileWithCaseSteps(): Promise<
  | {
    user: User;
    userProfile: UserProfileWithCaseSteps;
  }
  | null
> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  let userProfile;
  try {
    userProfile = await prisma.userProfile.upsert({
      where: { authId: user.id },
      create: {
        authId: user.id,
        email: user.email,
        fullName: getStringMetadata(user, "full_name"),
        avatarUrl: getStringMetadata(user, "avatar_url"),
        role: getRoleFromUser(user)
      },
      update: {
        email: user.email,
        fullName: getStringMetadata(user, "full_name"),
        avatarUrl: getStringMetadata(user, "avatar_url"),
        role: getRoleFromUser(user)
      },
      include: {
        caseSteps: true
      }
    });
  } catch {
    return null;
  }

  return { user, userProfile };
}
