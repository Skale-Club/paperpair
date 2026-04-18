# Research: Features for AOS Immigration Tools
_Researched: 2026-04-17_
_Confidence: MEDIUM — WebSearch/WebFetch restricted; based on deep domain knowledge of USCIS process, competitor analysis from training data, and known Reddit/forum patterns. Flag for live verification._

---

## Table Stakes

Features every AOS self-help tool must have. Missing any of these and the product feels incomplete or dangerous.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Step-by-step checklist with current status | Users are overwhelmed; they need to know exactly where they are | Medium | Must persist — localStorage is fragile |
| Complete form index (I-130, I-130A, I-485, I-864, I-765, I-131, I-693) | Users need to know which forms apply to their case | Low | Eligibility gating matters: I-765/I-131 eligibility depends on category |
| Per-form plain-English instructions | USCIS instructions are 40+ pages per form; people skip them | Medium | Side-by-side or inline, not just links |
| Document evidence guide | Evidence requirements are the #1 source of confusion and RFEs | Medium | Organized by form and category |
| Fee schedule with current amounts | Fees change; users need accurate totals before they start | Low | Must flag that fees change; link to official source |
| Filing timeline estimates | "How long will this take?" is the most-asked question | Low | Display as ranges; varies by field office |
| Mailing checklist (what goes in the envelope, in what order) | Wrong assembly is a top rejection reason for self-filers | Medium | Critical for first-time filers |
| USCIS office locator / correct lockbox address | Filing to the wrong address causes rejection | Low | Changes frequently; must link to live USCIS source |
| Progress save/resume | Users take weeks to compile documents; they cannot start over | High | localStorage is MVP; DB persistence is critical path |
| Eligibility screener / inadmissibility flags | Filing when ineligible wastes $1,000+ in fees | Medium | Bars: unlawful presence, criminal history, prior orders |

---

## Differentiators

Features that set leading tools apart. Not universally expected, but highly valued by users.

### Features Observed in BoundlessImmigration, RapidVisa, SimpleCitizen

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Smart interview (Q&A form fill) | Translate user answers into form fields; avoids form confusion | High | Boundless's core differentiator — avoids raw PDF interaction |
| Attorney review layer | A licensed attorney reviews completed packet before submission | High | Boundless charges premium for this; major trust signal |
| PDF auto-population | Pre-fill form fields from user-provided answers | High | Requires form field mapping per USCIS PDF version |
| Couple-specific dual-role UI | Separate views/tasks for petitioner (USC spouse) vs. beneficiary (immigrant) | Medium | Critical for AOS: both spouses have different roles and forms |
| Evidence strength scoring | Tell users if their evidence package is "weak" or "strong" | High | Differentiates casual tools from serious ones |
| Document upload with AI extraction | OCR/AI reads uploaded docs to confirm they match requirements | High | e.g., confirm passport photo meets USCIS spec, dates match |
| RFE response assistant | If user gets an RFE, guide them through responding | High | Rarely offered; high value, high liability risk |
| Case timeline tracker (post-submission) | Track receipt notice, biometrics, EAD, AP, interview, decision | Medium | Users obsessively track status; huge retention driver |
| Push notifications for case updates | Alert when USCIS processing times change or case moves | Medium | Requires backend job; Vercel needs care (no long-running) |
| Biometrics appointment prep | What to bring, what happens, what ASC locations look like | Low | Reduces anxiety; content-only feature |
| Interview question bank | Practice common USCIS marriage-based interview questions | Medium | Huge anxiety point; often neglected by competitors |
| Multi-language support | Many beneficiaries are non-native English speakers | High | Spanish most critical; not table stakes for v1 |
| Offline mode / print packet | Some users file from areas with poor internet or want paper trail | Medium | PDF export of entire checklist + document list |

---

## User Pain Points

What self-filers struggle with most, based on patterns from r/immigration, r/USCIS, r/immigration_advice, and immigration forums.

### Top Pain Points (HIGH confidence from domain knowledge)

1. **"Which forms do I actually need?"**
   - AOS has 7+ forms but not all apply to every case
   - I-765 and I-131 eligibility depends on visa category
   - I-130A required only if petitioner was previously married
   - Users routinely file the wrong set

2. **"How much evidence is enough for bona fide marriage?"**
   - No official threshold — USCIS uses discretion
   - Users don't know if 10 photos are enough or if they need 50
   - Joint lease, joint bank, joint insurance = strongest; users often lack all three
   - Long-distance couples (married before cohabitation) panic

3. **"Where do I mail this? Which lockbox?"**
   - USCIS has multiple lockboxes; wrong address = rejection and re-filing fees
   - Addresses change with USCIS policy updates
   - Chicago vs. Phoenix vs. Elgin vs. Lewisville depends on state + category

4. **"My receipt notice hasn't arrived — is something wrong?"**
   - Receipt notices take 2-8 weeks; users expect immediate confirmation
   - No official way to check before receipt notice arrives
   - Results in dozens of forum posts daily

5. **"The I-864 Affidavit of Support — how much income do I need?"**
   - 125% of federal poverty guideline; changes annually
   - Joint sponsors allowed; complex household size calculation
   - Users consistently miscalculate household size

6. **"I got an RFE — what do I do?"**
   - Users panic; many hire attorneys only after getting an RFE
   - Response deadline (87 days) creates urgency
   - Responding incorrectly to an RFE can make things worse

7. **"When will my EAD/AP combo card arrive?"**
   - EAD = work authorization; beneficiary cannot work without it
   - Processing times fluctuate 3-15 months; users are financially stressed
   - Combo card (EAD + AP) vs. separate cards creates confusion

8. **"What happens at the biometrics appointment?"**
   - First in-person USCIS contact; many have anxiety about government interactions
   - ASC (Application Support Center) procedures vary slightly by location
   - Users don't know if they need to bring anything beyond appointment notice

9. **"What will they ask at the interview?"**
   - Marriage-based interviews are unpredictable in depth
   - Stokoe/Stumpf interview (separate rooms) can happen without warning
   - Couples don't know how aligned their answers need to be

10. **"My case is taking forever — is it normal?"**
    - USCIS processing times are notoriously variable
    - Field office backlogs vary enormously (Atlanta = slow; Omaha = faster)
    - Users need benchmarks, not just official processing time estimates

---

## RFE Prevention

The most common RFE categories for marriage-based AOS, and features that reduce their likelihood.

### Top RFE Categories (MEDIUM confidence — based on USCIS policy and practitioner knowledge)

| RFE Category | Root Cause | Preventive Feature |
|--------------|------------|-------------------|
| Insufficient bona fide marriage evidence | Users don't know what "enough" looks like | Evidence strength guide: category-by-category checklist with examples |
| I-864 income insufficient / incorrect household size | Poverty guideline math is confusing | Income calculator: auto-flag if below 125% FPL based on household size |
| Missing or incorrect supporting documents | Checklist fatigue; users miss items | Dynamic checklist: items gray out only when document is uploaded |
| Medical exam issues (I-693 sealed envelope breach) | Users open the sealed envelope | Explicit warning callout: "DO NOT OPEN THIS ENVELOPE — instant disqualification" |
| Photos don't meet USCIS specifications | Users use wrong size, wrong background, wrong expression | Photo spec guide with visual examples; AI spec-check if upload feature exists |
| Form errors / inconsistencies across forms | Users put different names/dates on different forms | Cross-form consistency checker: flag if A-number, DOB, or name differs |
| Missing translations for non-English documents | Users attach foreign documents without certified translation | Translation requirement flag per document type |
| Sponsor's tax returns missing or wrong year | Users submit wrong year or wrong pages | Tax document guide: exactly which pages of which year's return to include |
| Priority date / visa availability confusion | Users file before visa is available (not applicable to immediate relatives, but users don't know) | Eligibility screener: confirm immediate relative status before proceeding |
| Address history gaps | I-485 requires 5-year address history; users leave gaps | Address history assistant: timeline-based input to ensure no gaps |

### Highest-Impact Preventive Features

1. **Evidence strength meter** — Visual indicator of how complete the bona fide marriage evidence package is
2. **Income / I-864 calculator** — Input: household size, income → output: pass/fail with margin
3. **Cross-form consistency checker** — Flag discrepancies in name spelling, DOB, A-number across all forms
4. **Document translation flag** — Automatically flag foreign-language documents as needing certified translation
5. **Sealed envelope warning** — Prominent, unavoidable UI warning about the I-693 sealed envelope rule
6. **Mailing order guide** — Exact order forms go in the envelope (USCIS has preferences; wrong order triggers scrutiny)

---

## Post-Submission Features

What matters to users after the packet is mailed.

| Feature | Why It Matters | Complexity | Priority |
|---------|---------------|------------|---------|
| Receipt notice tracker | "I sent it; when will I get confirmation?" is peak anxiety | Low (content) | High |
| Case status explainer | Decode USCIS case status codes into plain English | Low | High |
| Processing time tracker with field office comparison | Users want to know if their case is running slow | Medium | High |
| Biometrics appointment prep guide | What to bring, what to expect, duration | Low (content) | High |
| EAD interim benefits explainer | While EAD pending, what can beneficiary do? Travel? Work? | Low (content) | Medium |
| AP (Advance Parole) travel guide | Can beneficiary travel before green card? Risks of travel on AP | Low (content) | Medium |
| Interview preparation module | Practice questions, "day of" checklist, what to bring | Medium | High |
| Interview question bank (couple-synced) | Both spouses should practice with same questions | Medium | Medium |
| Post-interview status guide | What happens after interview: approval, denial, NOID | Low (content) | Medium |
| Green card arrival tracker | Card production → mailing → delivery timeline | Low (content) | Low |
| Conditional green card (CR-1 vs IR-1) explainer | 2-year conditional vs. 10-year permanent; removal of conditions process | Low (content) | Medium |
| I-751 Petition to Remove Conditions reminder | Must file 90 days before 2-year anniversary; easy to miss | Medium (reminder) | Medium |

---

## Anti-Features / Risks

Things to explicitly avoid that erode trust, create legal liability, or harm users.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Specific legal advice ("You qualify because...") | Unauthorized practice of law (UPL); state bar liability | General guidance + "consult an immigration attorney for your specific situation" |
| Guaranteed outcomes ("100% approval rate") | USCIS decisions are discretionary; false advertising | Use accurate statistics; never promise approval |
| Outdated fee amounts hardcoded in UI | USCIS fees change; users will over/underpay | Always link to official USCIS fee schedule; timestamp displayed amounts |
| Outdated form versions | USCIS rejects outdated form editions; versions change frequently | Link to official USCIS form pages; do not host form PDFs directly |
| "This replaces an attorney" framing | Creates false confidence in complex cases | Clear scope disclaimer: "for straightforward cases; complex situations need an attorney" |
| Storing sensitive PII without clear privacy policy | Immigration data is extremely sensitive (SSN, passport, A-number) | Explicit data handling disclosure; encryption at rest; no selling data |
| Auto-submit or "file for you" claims without attorney oversight | Legal and regulatory risk; UPL in most states | Position as preparation and guidance tool, not filing agent |
| Requiring credit card to see full checklist | Dark pattern; trust-killer for immigrant users who are already wary | Free core access; monetize on premium features (attorney review, RFE help) |
| Mixing up case types (K-1 vs. AOS vs. consular) | One wrong assumption can ruin a packet | Explicit eligibility screener at entry; scope-lock to confirmed AOS path |
| Generic "check USCIS website" as the answer | Users already tried that; they came to you because USCIS is confusing | Synthesize and explain USCIS content; don't just redirect |

---

## Key Recommendations

- **Persist progress to the database** — localStorage is the single biggest UX liability; if a user clears their browser or switches devices, their entire progress is lost. This is not acceptable for a process that takes 6-18 months.

- **Build the I-864 income calculator early** — It is the most mechanically complex calculation in AOS, affects nearly every filer, and is a top source of RFEs. A correct, current calculator is a genuine differentiator.

- **Make the evidence guide the heart of the product** — "Do I have enough evidence?" is the anxiety that drives the most forum posts. An opinionated, category-by-category evidence checklist with examples and a strength indicator addresses this directly.

- **Separate petitioner and beneficiary views** — The USC spouse (petitioner) and the immigrant (beneficiary) have different tasks, different forms, and different anxieties. A unified checklist conflates them; dual-role UI is a meaningful differentiator.

- **Biometrics and interview prep are retention features** — Users disengage after mailing the packet and re-engage for biometrics and interview. Content in these sections drives return visits and word-of-mouth referrals.

- **Add prominent sealed-envelope warning for I-693** — This is the single easiest-to-prevent catastrophic mistake. A bold, unavoidable callout at the medical exam step costs nothing and prevents an irreversible error.

- **Position as preparation tool, not legal service** — Every page should make clear this tool helps users prepare documents; it does not provide legal advice and does not replace an attorney for complex cases. This is both an ethical and legal necessity.

- **Source all filing addresses and fees dynamically** — Hardcoded USCIS addresses and fee amounts become wrong within months. Display sourced dates and link to official pages; consider a "last verified" indicator.

- **Build the interview question bank as a couple feature** — Interview prep is inherently a two-person exercise. Both spouses practicing the same questions and comparing answers is the most valuable form of interview preparation, and no mainstream tool does this well.

- **Plan for I-751 (removal of conditions) from day one** — Couples who get conditional green cards (married less than 2 years at approval) must file I-751 within a narrow window. A built-in reminder for this future milestone is a long-term retention and goodwill feature.
