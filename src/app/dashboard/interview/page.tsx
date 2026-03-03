"use client";

import React, { useState } from "react";
import { DashboardCard } from "@/components/ui/dashboard-card";

type Flashcard = {
    id: string;
    question: string;
    answer: string;
    category: string;
};

const FLASHCARDS: Flashcard[] = [
    {
        id: "q1",
        category: "Relationship History",
        question: "How and where did you two first meet?",
        answer: "Be specific about the date, location, and circumstances. Mention if you were introduced by someone or met online, and who initiated the first contact."
    },
    {
        id: "q2",
        category: "Relationship History",
        question: "Describe your first date.",
        answer: "Where did you go? What did you do? Try to remember small details like what you ate or what you talked about."
    },
    {
        id: "q3",
        category: "The Proposal",
        question: "Who proposed to whom, and how did it happen?",
        answer: "Where were you? Was there a ring? Who else knew about it beforehand?"
    },
    {
        id: "q4",
        category: "The Wedding",
        question: "How many people attended your wedding?",
        answer: "Be prepared to name some of the guests, especially family members on both sides. Where was the reception?"
    },
    {
        id: "q5",
        category: "Daily Life",
        question: "Who usually cooks in the relationship? What did you eat for dinner last night?",
        answer: "Officers ask mundane daily life questions to ensure you actually live together and share a routine."
    },
    {
        id: "q6",
        category: "Daily Life",
        question: "What are your spouse's parents' names?",
        answer: "You should know the names of your spouse's immediate family, including parents and siblings."
    }
];

export default function InterviewPrepPage() {
    const [activeCardId, setActiveCardId] = useState<string | null>(null);

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Interview Preparation</h1>
                <p className="mt-2 text-base text-slate-500">
                    Review common questions, learn what to expect, and make sure you have everything ready for the big day.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* What to Bring */}
                <DashboardCard title="What to Bring" subtitle="Essential items for the interview" className="h-full">
                    <ul className="space-y-3">
                        {[
                            "Original Interview Notice (I-797C)",
                            "Valid Passports (both spouses)",
                            "State ID or Driver's License",
                            "Original Marriage Certificate",
                            "Original Birth Certificates",
                            "A new set of bona fide evidence (photos, recent bank statements)",
                            "Medical Exam (I-693) in a sealed envelope (if not previously submitted)"
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                <div className="mt-0.5 shrink-0 text-indigo-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="leading-tight">{item}</span>
                            </li>
                        ))}
                    </ul>
                </DashboardCard>

                {/* Top Tips */}
                <DashboardCard title="Top Tips" subtitle="How to conduct yourself" className="md:col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-indigo-50/50 to-white">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <TipCard
                            title="Tell the Truth"
                            desc="If you don&apos;t know an answer or don&apos;t remember, just say &apos;I don&apos;t remember&apos;. Do not guess or make up an answer."
                        />
                        <TipCard
                            title="Dress Professionally"
                            desc="Treat it like a job interview. Business casual is highly recommended to show respect for the process."
                        />
                        <TipCard
                            title="Answer Only What is Asked"
                            desc="Don&apos;t volunteer extra information or go off on tangents. Keep your answers clear and concise."
                        />
                        <TipCard
                            title="Stay Calm"
                            desc="It&apos;s normal to be nervous. Officers know this. Take a deep breath before answering."
                        />
                    </div>
                </DashboardCard>
            </div>

            {/* Flashcards Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Practice Questions</h2>
                <p className="text-slate-500 mb-6">Click on a card to reveal the tip for answering.</p>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {FLASHCARDS.map((card) => {
                        const isFlipped = activeCardId === card.id;

                        return (
                            <div
                                key={card.id}
                                className="relative h-48 cursor-pointer group"
                                onClick={() => setActiveCardId(isFlipped ? null : card.id)}
                            >
                                <div className="w-full h-full transition-all duration-300 relative">
                                    {/* Front */}
                                    <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isFlipped ? 'opacity-0 z-0' : 'opacity-100 z-10'}`}>
                                        <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm group-hover:shadow-md transition-shadow flex flex-col justify-center text-center">
                                            <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-2">{card.category}</span>
                                            <p className="text-lg font-medium text-slate-900">{card.question}</p>
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isFlipped ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                        <div className="h-full bg-indigo-600 rounded-2xl p-6 shadow-md flex flex-col justify-center text-center text-white">
                                            <p className="text-sm/relaxed">{card.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function TipCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <h4 className="font-semibold text-slate-900 mb-1">{title}</h4>
            <p className="text-sm text-slate-500 leading-snug">{desc}</p>
        </div>
    );
}
