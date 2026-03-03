import Image from "next/image";

import { getCurrentUserAndProfileWithCaseSteps } from "@/lib/current-user-profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const context = await getCurrentUserAndProfileWithCaseSteps();

    if (!context) return null;

    const { userProfile } = context;
    const firstName = userProfile.fullName?.split(" ")[0] || "";
    const lastName = userProfile.fullName?.split(" ").slice(1).join(" ") || "";

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Public Profile</h1>
                <p className="mt-1 text-sm text-slate-600">
                    People visiting your profile will see the information below.
                </p>
            </div>

            <div className="space-y-6">
                {/* Photo */}
                <div>
                    <label className="block text-sm font-medium text-slate-700">Photo</label>
                    <div className="mt-3 flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-slate-200">
                            {userProfile.avatarUrl ? (
                                <Image
                                    src={userProfile.avatarUrl}
                                    alt="Avatar"
                                    width={80}
                                    height={80}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-semibold text-slate-400">
                                    {(userProfile.fullName || userProfile.email || "?").charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <button className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-200 transition-colors">
                            Change
                        </button>
                    </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="firstName" className="block text-xs text-slate-600 mb-1 ml-1">
                            First name
                        </label>
                        <input
                            type="text"
                            id="firstName"
                            defaultValue={firstName}
                            className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-xs text-slate-600 mb-1 ml-1">
                            Last name
                        </label>
                        <input
                            type="text"
                            id="lastName"
                            defaultValue={lastName}
                            className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                        />
                    </div>
                </div>

                {/* About */}
                <div>
                    <label htmlFor="about" className="block text-xs text-slate-600 mb-1 ml-1">
                        About
                    </label>
                    <textarea
                        id="about"
                        rows={4}
                        placeholder="Share your story"
                        className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 resize-none"
                    />
                </div>

                {/* Pronouns */}
                <div>
                    <label htmlFor="pronouns" className="block text-xs text-slate-600 mb-1 ml-1">
                        Pronouns
                    </label>
                    <select
                        id="pronouns"
                        className="w-full appearance-none rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    >
                        <option value="">Add pronouns</option>
                        <option value="he/him">he/him</option>
                        <option value="she/her">she/her</option>
                        <option value="they/them">they/them</option>
                    </select>
                    <p className="mt-2 text-xs text-slate-500 leading-tight ml-1">
                        Choose up to two pronoun sets to display on your profile.
                    </p>
                </div>

                {/* Website */}
                <div>
                    <label htmlFor="website" className="block text-xs text-slate-600 mb-1 ml-1">
                        Website
                    </label>
                    <input
                        type="text"
                        id="website"
                        placeholder="Add a link to drive traffic to your site"
                        className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                </div>

                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-xs text-slate-600 mb-1 ml-1">
                        Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        defaultValue={firstName.toLowerCase() || userProfile.authId.substring(0, 8)}
                        className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                    />
                    <p className="mt-1 text-xs text-slate-500 ml-1">
                        www.paperpair.com/{firstName.toLowerCase() || userProfile.authId.substring(0, 8)}
                    </p>
                </div>
            </div>
        </div>
    );
}
