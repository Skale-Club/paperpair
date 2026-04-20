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
    if (status === "Filed") return "bg-emerald-50 text-emerald-700 ring-emerald-200/50";
    if (status === "Ready for Review") return "bg-amber-50 text-amber-700 ring-amber-200/50";
    return "bg-slate-50 text-slate-600 ring-slate-200/50";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users by name, email, or status"
          className="w-full max-w-md rounded-xl border border-trust-muted/30 px-4 py-2.5 text-sm ring-trust/20 transition-all focus:border-trust focus:ring-4"
        />
        <p className="text-xs font-bold uppercase tracking-wider text-trust-muted">{filtered.length} results</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-trust-muted/20 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-trust-muted/10 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4 text-center">Last Activity</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-trust-muted/5">
              {filtered.map((user) => (
                <tr 
                  key={user.id}
                  className="odd:bg-white even:bg-slate-50/50 hover:bg-trust-muted/5 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 group-hover:text-trust transition-colors">{user.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ring-1 ${badgeColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-24 rounded-full bg-trust-muted/20">
                        <div
                          className="h-full rounded-full bg-trust shadow-[0_0_8px_rgba(108,123,78,0.4)]"
                          style={{ width: `${user.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-trust">{user.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{user.lastActivity}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-trust hover:underline underline-offset-4"
                    >
                      Review
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
