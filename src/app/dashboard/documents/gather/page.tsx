"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardCard } from "@/components/ui/dashboard-card";

type ChecklistItem = {
    id: string;
    label: string;
    description: string;
    category: "identity" | "financial" | "relationship" | "other";
};

const ITEMS: ChecklistItem[] = [
    { id: "id-1", category: "identity", label: "Government Issued Photo ID", description: "Passport, Driver's License, or National ID card." },
    { id: "id-2", category: "identity", label: "Birth Certificate", description: "Original birth certificate with translation if not in English." },
    { id: "id-3", category: "identity", label: "Current Visa / I-94", description: "Proof of lawful entry into the US, if applicable." },
    { id: "fin-1", category: "financial", label: "Most Recent Tax Returns", description: "Form 1040 and W-2s for the last 3 years." },
    { id: "fin-2", category: "financial", label: "Recent Pay Stubs", description: "Pay stubs for the last 6 months to prove current income." },
    { id: "fin-3", category: "financial", label: "Employment Letter", description: "Letter from current employer confirming position and salary." },
    { id: "rel-1", category: "relationship", label: "Marriage Certificate", description: "Original marriage certificate." },
    { id: "rel-2", category: "relationship", label: "Joint Bank Account Statements", description: "Showing both names and shared financial responsibility." },
    { id: "rel-3", category: "relationship", label: "Photos Together", description: "5-10 photographs spanning the relationship, ideally with family/friends." },
    { id: "rel-4", category: "relationship", label: "Joint Lease or Mortgage", description: "Proof of living together at the same address." },
];

export default function DocumentGatherPage() {
    const router = useRouter();
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem("paperpair_doc_checklist");
        if (saved) {
            try {
                setCheckedItems(JSON.parse(saved));
            } catch (e) {
                console.error("Could not parse checklist", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("paperpair_doc_checklist", JSON.stringify(checkedItems));
        }
    }, [checkedItems, isLoaded]);

    const toggleItem = (id: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const progress = useMemo(() => {
        const total = ITEMS.length;
        const complete = Object.values(checkedItems).filter(Boolean).length;
        return {
            total,
            complete,
            percentage: total === 0 ? 0 : Math.round((complete / total) * 100)
        };
    }, [checkedItems]);

    // Group items by category
    const groupedItems = useMemo(() => {
        const groups: Record<string, ChecklistItem[]> = {
            identity: [],
            financial: [],
            relationship: []
        };
        ITEMS.forEach(item => {
            if (groups[item.category]) {
                groups[item.category].push(item);
            }
        });
        return groups;
    }, []);

    if (!isLoaded) return null; // Prevent hydration mismatch

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gather Documents</h1>
                <p className="mt-2 text-base text-slate-500">
                    Use this checklist to track the evidence and documents you need to complete your application.
                </p>
            </div>

            {/* Progress Header */}
            <DashboardCard className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Collection Progress</h2>
                        <div className="flex items-center gap-4">
                            <div className="h-3 flex-1 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
                                    style={{ width: `${progress.percentage}%` }}
                                />
                            </div>
                            <span className="font-bold text-indigo-700 w-12 text-right">{progress.percentage}%</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            {progress.complete} of {progress.total} documents collected
                        </p>
                    </div>

                    {progress.percentage === 100 && (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-semibold">All documents ready!</span>
                        </div>
                    )}
                </div>
            </DashboardCard>

            {/* Checklist Sections */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Identity */}
                <DashboardCard title="Identity & Forms" subtitle="Core identification documents" className="h-full">
                    <div className="space-y-4">
                        {groupedItems.identity.map(item => (
                            <CheckRow
                                key={item.id}
                                item={item}
                                checked={!!checkedItems[item.id]}
                                onChange={() => toggleItem(item.id)}
                            />
                        ))}
                    </div>
                </DashboardCard>

                {/* Financial */}
                <DashboardCard title="Financial Evidence" subtitle="Proof of income and support" className="h-full">
                    <div className="space-y-4">
                        {groupedItems.financial.map(item => (
                            <CheckRow
                                key={item.id}
                                item={item}
                                checked={!!checkedItems[item.id]}
                                onChange={() => toggleItem(item.id)}
                            />
                        ))}
                    </div>
                </DashboardCard>

                {/* Relationship */}
                <DashboardCard title="Bona Fide Evidence" subtitle="Proof of genuine relationship" className="h-full">
                    <div className="space-y-4">
                        {groupedItems.relationship.map(item => (
                            <CheckRow
                                key={item.id}
                                item={item}
                                checked={!!checkedItems[item.id]}
                                onChange={() => toggleItem(item.id)}
                            />
                        ))}
                    </div>
                </DashboardCard>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm transition-colors hover:bg-indigo-700"
                    onClick={() => {
                        router.push("/documentation-filling");
                    }}
                >
                    Proceed to Upload Evidence
                </button>
            </div>
        </div>
    );
}

function CheckRow({ item, checked, onChange }: { item: ChecklistItem, checked: boolean, onChange: () => void }) {
    return (
        <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${checked ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
            }`}>
            <div className="relative flex items-center pt-1">
                <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                    checked={checked}
                    onChange={onChange}
                />
            </div>
            <div className="flex-1">
                <p className={`text-sm font-semibold transition-colors ${checked ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {item.label}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                    {item.description}
                </p>
            </div>
        </label>
    );
}
