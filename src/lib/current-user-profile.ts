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

function getProfileSyncData(user: UserWithEmail) {
  return {
    email: user.email,
    fullName: getStringMetadata(user, "full_name"),
    avatarUrl: getStringMetadata(user, "avatar_url"),
    role: getRoleFromUser(user)
  };
}

function getProfileUpdateData(
  current: {
    email: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: Role;
  },
  next: ReturnType<typeof getProfileSyncData>
): Prisma.UserProfileUpdateInput {
  const updateData: Prisma.UserProfileUpdateInput = {};

  if (current.email !== next.email) {
    updateData.email = next.email;
  }

  if (current.fullName !== next.fullName) {
    updateData.fullName = next.fullName;
  }

  if (current.avatarUrl !== next.avatarUrl) {
    updateData.avatarUrl = next.avatarUrl;
  }

  if (current.role !== next.role) {
    updateData.role = next.role;
  }

  return updateData;
}

async function findOrSyncUserProfile(user: UserWithEmail) {
  const nextProfile = getProfileSyncData(user);

  const currentProfile = await prisma.userProfile.findUnique({
    where: { authId: user.id }
  });

  if (!currentProfile) {
    return prisma.userProfile.create({
      data: {
        authId: user.id,
        ...nextProfile
      }
    });
  }

  const updateData = getProfileUpdateData(currentProfile, nextProfile);

  if (Object.keys(updateData).length === 0) {
    return currentProfile;
  }

  return prisma.userProfile.update({
    where: { id: currentProfile.id },
    data: updateData
  });
}

async function findOrSyncUserProfileWithCaseSteps(user: UserWithEmail) {
  const nextProfile = getProfileSyncData(user);

  const currentProfile = await prisma.userProfile.findUnique({
    where: { authId: user.id },
    include: {
      caseSteps: true
    }
  });

  if (!currentProfile) {
    return prisma.userProfile.create({
      data: {
        authId: user.id,
        ...nextProfile
      },
      include: {
        caseSteps: true
      }
    });
  }

  const updateData = getProfileUpdateData(currentProfile, nextProfile);

  if (Object.keys(updateData).length === 0) {
    return currentProfile;
  }

  return prisma.userProfile.update({
    where: { id: currentProfile.id },
    data: updateData,
    include: {
      caseSteps: true
    }
  });
}

async function getCurrentUser(): Promise<UserWithEmail | null> {
  const supabase = await createClient();
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

  try {
    const userProfile = await findOrSyncUserProfile(user);
    return { user, userProfile };
  } catch {
    return null;
  }
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

  try {
    const userProfile = await findOrSyncUserProfileWithCaseSteps(user);
    return { user, userProfile };
  } catch {
    return null;
  }
}
