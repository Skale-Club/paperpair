"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  INTERVIEW_QUESTIONS,
  CATEGORIES,
  type Category,
} from "@/lib/interview-questions";

type Role = "USER" | "ADMIN";

interface InterviewClientProps {
  userRole: Role;
}

const CHECKLIST_ITEMS = [
  "Original Interview Notice (I-797C)",
  "Valid Passports (both spouses)",
  "State ID or Driver's License (both spouses)",
  "Original Marriage Certificate",
  "Original Birth Certificates (both spouses)",
  "Bona fide evidence (joint photos, recent bank statements, lease/mortgage)",
  "Medical Exam (I-693) in sealed envelope — if not previously submitted",
  "Any requested RFE response documents",
];

export function InterviewClient({ userRole: _userRole }: InterviewClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean[]>(
    () => Array(CHECKLIST_ITEMS.length).fill(false)
  );
  // self-select toggle: null = neither highlighted, "petitioner" or "beneficiary"
  const [selectedRole, setSelectedRole] = useState<
    "petitioner" | "beneficiary" | null
  >(null);

  const allChecked = checked.every(Boolean);

  function toggle(index: number) {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }

  const visibleQuestions =
    activeCategory === "All"
      ? INTERVIEW_QUESTIONS
      : INTERVIEW_QUESTIONS.filter((q) => q.category === activeCategory);

  return (
    <div className="space-y-10">
      {/* SECTION 1: Practice Questions */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Practice Questions</h2>
        <p className="text-sm text-slate-500 mb-5">
          Click a card to reveal the answer tip. Click again to hide.
        </p>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            const count =
              cat === "All"
                ? null
                : INTERVIEW_QUESTIONS.filter((q) => q.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "text-white"
                    : "bg-sand-100 text-slate-600 hover:bg-sand-200"
                )}
                style={
                  isActive ? { background: "var(--color-trust)" } : undefined
                }
              >
                {cat}
                {count !== null && (
                  <span className="ml-1 opacity-75">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Flashcard grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleQuestions.map((card) => {
            const isFlipped = activeCardId === card.id;
            return (
              <div
                key={card.id}
                className="relative h-44 cursor-pointer group"
                onClick={() =>
                  setActiveCardId(isFlipped ? null : card.id)
                }
              >
                <div className="w-full h-full transition-all duration-300 relative">
                  {/* Front face */}
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full transition-opacity duration-300",
                      isFlipped ? "opacity-0 z-0" : "opacity-100 z-10"
                    )}
                  >
                    <div className="h-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm group-hover:shadow-md transition-shadow flex flex-col justify-center text-center">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                        {card.category}
                      </span>
                      <p className="text-base font-medium text-slate-900">
                        {card.question}
                      </p>
                    </div>
                  </div>

                  {/* Back face */}
                  <div
                    className={cn(
                      "absolute inset-0 w-full h-full transition-opacity duration-300",
                      isFlipped ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                  >
                    <div
                      className="h-full rounded-2xl p-5 shadow-md flex flex-col justify-center text-center text-white"
                      style={{ background: "var(--color-trust)" }}
                    >
                      <p className="text-sm/relaxed">{card.answerTip}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: What to Bring Checklist */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-1">What to Bring</h2>
        <p className="text-sm text-slate-500 mb-5">
          Check off each item as you prepare for interview day.
        </p>

        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item, i) => (
            <label key={i} className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                checked={checked[i]}
                onChange={() => toggle(i)}
                aria-label={item}
              />
              <span
                className={cn(
                  "text-sm text-slate-700",
                  checked[i] && "text-slate-400 line-through"
                )}
              >
                {item}
              </span>
            </label>
          ))}
        </div>

        {allChecked && (
          <p className="mt-4 text-sm font-semibold text-green-700">
            All items checked — you are ready for the interview.
          </p>
        )}
      </section>

      {/* SECTION 3: Interview Tips */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Interview Tips</h2>
        <p className="text-sm text-slate-500 mb-5">
          Select your role to highlight tips most relevant to you.
        </p>

        {/* Self-select toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() =>
              setSelectedRole(
                selectedRole === "petitioner" ? null : "petitioner"
              )
            }
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              selectedRole === "petitioner"
                ? "text-white"
                : "bg-sand-100 text-slate-600 hover:bg-sand-200"
            )}
            style={
              selectedRole === "petitioner"
                ? { background: "var(--color-trust)" }
                : undefined
            }
          >
            I am the Petitioner
          </button>
          <button
            onClick={() =>
              setSelectedRole(
                selectedRole === "beneficiary" ? null : "beneficiary"
              )
            }
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              selectedRole === "beneficiary"
                ? "text-white"
                : "bg-sand-100 text-slate-600 hover:bg-sand-200"
            )}
            style={
              selectedRole === "beneficiary"
                ? { background: "var(--color-trust)" }
                : undefined
            }
          >
            I am the Beneficiary
          </button>
        </div>

        <div className="space-y-6">
          {/* Petitioner section */}
          <div
            className={cn(
              "rounded-xl p-4 transition-colors",
              selectedRole === "petitioner"
                ? "border-l-4 bg-sand-50"
                : "border border-slate-200 bg-white"
            )}
            style={
              selectedRole === "petitioner"
                ? { borderLeftColor: "var(--color-trust)" }
                : undefined
            }
          >
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              For the Petitioner (U.S. Citizen)
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <TipCard
                title="Know Your Petition"
                desc="Be ready to explain why you filed the I-130, when you filed it, and what supporting documents you included."
              />
              <TipCard
                title="Separate Interview"
                desc="You may be interviewed separately from your spouse. Stay calm and answer only what is asked. Minor discrepancies in memory are normal."
              />
              <TipCard
                title="Financial Responsibility"
                desc="As the petitioner, you signed the I-864 Affidavit of Support. Know your household size, income, and that you understand the obligations."
              />
              <TipCard
                title="Demonstrate the Relationship"
                desc="Bring printed copies of joint evidence — photos, lease, bank statements — and be ready to reference specific shared experiences."
              />
            </div>
          </div>

          {/* Beneficiary section */}
          <div
            className={cn(
              "rounded-xl p-4 transition-colors",
              selectedRole === "beneficiary"
                ? "border-l-4 bg-sand-50"
                : "border border-slate-200 bg-white"
            )}
            style={
              selectedRole === "beneficiary"
                ? { borderLeftColor: "var(--color-trust)" }
                : undefined
            }
          >
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              For the Beneficiary (Immigrant Spouse)
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <TipCard
                title="Know Your Entry History"
                desc="The officer will ask about your visa type, your date of entry, your I-94 record, and whether you have ever departed the U.S. since filing."
              />
              <TipCard
                title="Separate Interview"
                desc="If interviewed alone, answer questions about your relationship honestly. Do not panic if you cannot recall a minor detail — say 'I don't remember exactly.'"
              />
              <TipCard
                title="Know What Was Filed"
                desc="Be familiar with the forms in your packet (I-485, I-131, I-765) and their purpose. You do not need to memorize every field, but understand what each form is for."
              />
              <TipCard
                title="Your Documents"
                desc="Know your passport expiry date, where your birth certificate is from, and the details of your medical exam (I-693 sealed envelope status)."
              />
            </div>
          </div>

          {/* General Tips section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-base font-semibold text-slate-900 mb-3">
              General Tips
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <TipCard
                title="Tell the Truth"
                desc="If you don't know an answer or don't remember, just say 'I don't remember'. Do not guess or make up an answer."
              />
              <TipCard
                title="Dress Professionally"
                desc="Treat it like a job interview. Business casual is highly recommended to show respect for the process."
              />
              <TipCard
                title="Answer Only What is Asked"
                desc="Don't volunteer extra information or go off on tangents. Keep your answers clear and concise."
              />
              <TipCard
                title="Stay Calm"
                desc="It's normal to be nervous. Officers know this. Take a deep breath before answering."
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TipCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg bg-white border border-slate-100 shadow-sm p-4">
      <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 leading-snug">{desc}</p>
    </div>
  );
}
