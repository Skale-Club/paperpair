"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type DerivedStatus = "In Progress" | "Ready for Review" | "Filed";

export type UiUser = {
  id: string;
  name: string;
  email: string;
  status: DerivedStatus;
  progress: number;
  lastActivity: string;
};

export function AdminUsersTable({ users }: { users: UiUser[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.status.toLowerCase().includes(term)
    );
  }, [query, users]);

  const badgeColor = (status: DerivedStatus) => {
    if (status === "Filed") return "bg-green-100 text-green-700";
    if (status === "Ready for Review") return "bg-amber-100 text-amber-800";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by name, email, or status"
          className="w-full max-w-md rounded-lg border border-sand-300 px-3 py-2 text-sm"
        />
        <p className="text-xs text-sand-600">{filtered.length} results</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-sand-50 text-xs uppercase text-sand-600">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Last Activity</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-100">
            {filtered.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-sand-900">{user.name}</p>
                  <p className="text-xs text-sand-600">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-28 rounded-full bg-sand-100">
                      <div
                        className="h-full rounded-full bg-navy"
                        style={{ width: `${user.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-sand-700">{user.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-sand-600">{user.lastActivity}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="text-xs font-semibold text-navy underline"
                  >
                    Review mode
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
