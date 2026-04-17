export type ChecklistItem = {
  id: string;
  label: string;
};

export const SECTION_CHECKLISTS: Record<string, ChecklistItem[]> = {
  "determine-eligibility": [
    { id: "elig-1", label: "Your spouse is a U.S. citizen or lawful permanent resident" },
    { id: "elig-2", label: "Your marriage is legally valid and properly documented" },
    { id: "elig-3", label: "You entered the U.S. lawfully (or qualify for an exception)" },
    { id: "elig-4", label: "No disqualifying criminal history or immigration violations" },
    { id: "elig-5", label: "No prior removal orders or visa fraud on record" },
  ],

  "gather-documents": [
    { id: "doc-1", label: "Beneficiary's passport — bio page, visa page, and all entry stamps (legible copies)" },
    { id: "doc-2", label: "Beneficiary's I-94 record — printed from cbp.dhs.gov" },
    { id: "doc-3", label: "Beneficiary's birth certificate — original or certified copy with certified English translation" },
    { id: "doc-4", label: "Petitioner's proof of U.S. citizenship — passport or U.S. birth certificate" },
    { id: "doc-5", label: "Marriage certificate — original certified copy from the issuing authority" },
    { id: "doc-6", label: "Prior divorce or death certificates (if applicable) — with certified English translation" },
    { id: "doc-7", label: "8 passport-style photos — 2×2 in., white background, no glasses, taken within last 6 months" },
    { id: "doc-8", label: "Verify all names match across all documents (note any discrepancies)" },
    { id: "doc-9", label: "Make photocopies of all original documents — keep originals for the interview" },
  ],

  "relationship-evidence": [
    { id: "ev-1", label: "Joint bank account statement — showing both names and current shared address" },
    { id: "ev-2", label: "Shared lease or mortgage — both names on the document" },
    { id: "ev-3", label: "Utility bills or official mail addressed to both spouses at the same address" },
    { id: "ev-4", label: "Joint federal tax return (Married Filing Jointly) — if available" },
    { id: "ev-5", label: "Joint insurance policy — health, auto, or life insurance listing both spouses" },
    { id: "ev-6", label: "10–20 photos together — varied occasions, dated, with captions identifying people" },
    { id: "ev-7", label: "Beneficiary designations — each spouse named on bank accounts, 401k, or life insurance" },
    { id: "ev-8", label: "Support letters from family or friends attesting to the genuine relationship (optional but helpful)" },
  ],

  "medical-exam-prep": [
    { id: "med-prep-1", label: "Locate a USCIS-designated Civil Surgeon at uscis.gov/findadoctor" },
    { id: "med-prep-2", label: "Call the Civil Surgeon's office to confirm pricing and availability" },
    { id: "med-prep-3", label: "Schedule the appointment — allow 1–2 weeks for lab results" },
    { id: "med-prep-4", label: "Gather vaccination records to bring to the appointment" },
    { id: "med-prep-5", label: "Confirm what to bring: valid photo ID (passport) and vaccination history" },
  ],

  "medical-exam-complete": [
    { id: "med-1", label: "Attend the Civil Surgeon appointment with your passport and vaccination records" },
    { id: "med-2", label: "Complete all required tests — TB test, blood work, vaccinations if needed" },
    { id: "med-3", label: "If a follow-up visit is required (e.g., TB skin test read), attend it" },
    { id: "med-4", label: "Receive the sealed Form I-693 envelope from the doctor — do NOT open it" },
    { id: "med-5", label: "Pay the exam fee and retain the receipt for your records" },
    { id: "med-6", label: "Store the sealed envelope safely until you assemble the filing packet" },
  ],

  "form-i130": [
    { id: "i130-1", label: "Download Form I-130 (current edition) from uscis.gov/i-130" },
    { id: "i130-2", label: "Complete petitioner's information — full name, address, citizenship status" },
    { id: "i130-3", label: "Complete beneficiary's information — name, DOB, country of birth, passport number, I-94" },
    { id: "i130-4", label: "Enter marriage date, location, and indicate any prior marriages for both spouses" },
    { id: "i130-5", label: "Petitioner signs and dates the form (beneficiary does NOT sign I-130)" },
    { id: "i130-6", label: "Attach petitioner's proof of U.S. citizenship (copy of passport or birth certificate)" },
    { id: "i130-7", label: "Attach certified copy of the marriage certificate" },
    { id: "i130-8", label: "Include 2 passport-style photos of petitioner and 2 of beneficiary in a labeled envelope" },
    { id: "i130-9", label: "Prepare filing fee: $675 — check or money order payable to 'U.S. Department of Homeland Security'" },
  ],

  "form-i130a": [
    { id: "i130a-1", label: "Download Form I-130A from uscis.gov (included with the I-130 package)" },
    { id: "i130a-2", label: "Complete beneficiary's residential addresses for the last 5 years — no gaps allowed" },
    { id: "i130a-3", label: "Complete beneficiary's employment history for the last 5 years" },
    { id: "i130a-4", label: "Enter beneficiary's parents' full names, dates of birth, and current addresses" },
    { id: "i130a-5", label: "Beneficiary signs and dates the form" },
    { id: "i130a-6", label: "Attach copy of beneficiary's passport (bio page and visa page)" },
    { id: "i130a-7", label: "Attach copy of I-94 record" },
    { id: "i130a-8", label: "Attach certified birth certificate with certified English translation" },
  ],

  "form-i485": [
    { id: "i485-1", label: "Download Form I-485 (current edition) from uscis.gov/i-485" },
    { id: "i485-2", label: "Part 1: Enter beneficiary's full name, other names used, address, DOB, country of birth" },
    { id: "i485-3", label: "Part 2: Select 'Immediate Relative of a U.S. Citizen' as basis for eligibility" },
    { id: "i485-4", label: "Part 3: Enter I-94 number, visa class (e.g., B-2), and date and port of entry" },
    { id: "i485-5", label: "Parts 8–9: Answer ALL eligibility questions honestly — note any unlawful presence or unauthorized employment" },
    { id: "i485-6", label: "Beneficiary signs and dates the form" },
    { id: "i485-7", label: "Prepare filing fee: $1,440 — separate check or Form G-1450" },
    { id: "i485-8", label: "Complete Form G-1145 (e-notification of acceptance) and clip it to the front" },
    { id: "i485-9", label: "Include 2 passport-style photos of beneficiary in a labeled envelope" },
    { id: "i485-10", label: "Attach copies of passport, visa, I-94, birth certificate (with translation), and marriage certificate" },
  ],

  "form-i864": [
    { id: "i864-1", label: "Download Form I-864 (current edition) from uscis.gov/i-864" },
    { id: "i864-2", label: "Petitioner completes Parts 1–3: personal info, household size (at minimum: petitioner + beneficiary = 2)" },
    { id: "i864-3", label: "Verify petitioner's income meets 125% of the federal poverty guideline for your household size" },
    { id: "i864-4", label: "If petitioner's income is insufficient, identify a joint sponsor who qualifies independently" },
    { id: "i864-5", label: "Attach petitioner's most recent federal tax return transcript (request from IRS at irs.gov/transcript)" },
    { id: "i864-6", label: "Attach petitioner's W-2s and 2–3 most recent pay stubs" },
    { id: "i864-7", label: "Attach a letter from petitioner's employer confirming current position, salary, and employment type" },
    { id: "i864-8", label: "Petitioner signs and dates Form I-864" },
    { id: "i864-9", label: "If joint sponsor: joint sponsor completes a separate I-864 with their own full financial documentation" },
    { id: "i864-10", label: "If joint sponsor uses household income: also complete Form I-864A for each contributing household member" },
    { id: "i864-11", label: "Verify no field is blank on any I-864 — write 'None' or 'N/A' where not applicable" },
  ],

  "form-i765-i131": [
    { id: "i765-1", label: "Download Form I-765 (current edition) from uscis.gov/i-765" },
    { id: "i765-2", label: "Mark eligibility category: (c)(9) — spouse of a U.S. citizen adjusting status" },
    { id: "i765-3", label: "If requesting a new SSN for the first time, check the appropriate box" },
    { id: "i765-4", label: "Beneficiary signs and dates Form I-765" },
    { id: "i765-5", label: "Include 2 passport-style photos and copies of passport bio page and I-94" },
    { id: "i765-6", label: "Prepare filing fee: $260 — separate check" },
    { id: "i131-1", label: "Download Form I-131 (current edition) from uscis.gov/i-131" },
    { id: "i131-2", label: "Mark application type: Advance Parole for a pending Adjustment of Status (box 1.d)" },
    { id: "i131-3", label: "Describe intended travel: country to visit and general purpose (e.g., visit family)" },
    { id: "i131-4", label: "Beneficiary signs and dates Form I-131" },
    { id: "i131-5", label: "Include 2 passport-style photos and copies of passport bio page and I-94" },
    { id: "i131-6", label: "Prepare filing fee: $630 — separate check" },
  ],

  "documentation-bundle": [
    { id: "bundle-1", label: "Write a cover letter listing every enclosed form and document section" },
    { id: "bundle-2", label: "Clip Form G-1145 to the very top of the packet" },
    { id: "bundle-3", label: "Place all filing fee payments (separate checks) together at the front" },
    { id: "bundle-4", label: "Attach Form I-130 with: citizenship proof, marriage certificate, and photos" },
    { id: "bundle-5", label: "Attach Form I-130A with: passport copy, I-94, birth certificate + translation" },
    { id: "bundle-6", label: "Attach Form I-485 with: 2 photos and sealed I-693 medical exam envelope (on top of I-485)" },
    { id: "bundle-7", label: "Attach Form I-864 (petitioner) with all financial documents" },
    { id: "bundle-8", label: "Attach Form I-864 (joint sponsor) with their financial documents — if applicable" },
    { id: "bundle-9", label: "Attach Form I-765 (EAD application) with 2 photos" },
    { id: "bundle-10", label: "Attach Form I-131 (Advance Parole) with 2 photos" },
    { id: "bundle-11", label: "Include bona fide evidence packet (bank statements, utility bills, joint photos)" },
    { id: "bundle-12", label: "Make a complete photocopy of the entire assembled packet for your own records" },
  ],

  "instructions": [
    { id: "inst-1", label: "Print all forms single-sided on standard 8.5×11 (letter) paper only" },
    { id: "inst-2", label: "Use binder clips only to hold sections together — no staples, no tape" },
    { id: "inst-3", label: "Do not highlight, write on, or make corrections directly on any government form" },
    { id: "inst-4", label: "All checks payable to 'U.S. Department of Homeland Security'" },
    { id: "inst-5", label: "Confirm all form edition dates are current — outdated editions will be rejected" },
    { id: "inst-6", label: "Verify every required signature is present on every form before packing" },
  ],

  "mailing": [
    { id: "mail-1", label: "Confirm the correct USCIS lockbox address for your state of residence at uscis.gov" },
    { id: "mail-2", label: "Pack all documents securely in a sturdy envelope or rigid box" },
    { id: "mail-3", label: "Send via USPS Certified Mail with Return Receipt — or USPS Priority Mail with tracking" },
    { id: "mail-4", label: "Save the tracking number and take a photo of the mailing receipt" },
    { id: "mail-5", label: "Track the shipment online and print or screenshot the delivery confirmation" },
  ],

  "track-notices": [
    { id: "notice-1", label: "Wait for I-797C (Notice of Action) receipts — typically arrive 2–4 weeks after mailing" },
    { id: "notice-2", label: "Verify all names and information on each receipt notice are correct" },
    { id: "notice-3", label: "Create a myUSCIS account at my.uscis.gov if you haven't already" },
    { id: "notice-4", label: "Add all receipt numbers to your myUSCIS account to track each case online" },
    { id: "notice-5", label: "Record the receipt dates — they establish your place in line" },
    { id: "notice-6", label: "If no receipts arrive after 4 weeks, contact USCIS at 800-375-5283" },
  ],

  "biometrics": [
    { id: "bio-1", label: "Receive the biometrics appointment notice (I-797C) with date, time, and ASC location" },
    { id: "bio-2", label: "Bring the appointment notice and a valid photo ID (passport) to the appointment" },
    { id: "bio-3", label: "Attend the ASC on time — fingerprints and a photo will be taken" },
    { id: "bio-4", label: "Keep the appointment stub from the ASC — bring it to your interview later" },
    { id: "bio-5", label: "Monitor myUSCIS for case updates following the biometrics appointment" },
  ],

  "ead-ap-card": [
    { id: "ead-1", label: "Monitor myUSCIS for EAD / Advance Parole approval updates" },
    { id: "ead-2", label: "Receive the EAD/AP combo card by mail — typically 3–5 months after filing" },
    { id: "ead-3", label: "If SSN was requested: your Social Security card should arrive within 2–3 weeks" },
    { id: "ead-4", label: "If SSN not received automatically: visit your local SSA office with EAD and passport" },
    { id: "ead-5", label: "Begin authorized employment using the EAD card if needed" },
    { id: "ead-6", label: "Do NOT travel internationally until you have the Advance Parole document in hand" },
  ],

  "interview-prep": [
    { id: "int-prep-1", label: "Receive the interview notice (I-797C) with date, time, and USCIS field office address" },
    { id: "int-prep-2", label: "Confirm both spouses will attend — both are required to appear" },
    { id: "int-prep-3", label: "Organize a folder with originals: passports, birth certificates, marriage certificate" },
    { id: "int-prep-4", label: "Prepare updated bona fide evidence: recent bank statements, new photos, travel records" },
    { id: "int-prep-5", label: "Review your submitted application together to ensure your answers are consistent" },
    { id: "int-prep-6", label: "Practice common interview questions as a couple (relationship history, daily routines, family)" },
    { id: "int-prep-7", label: "Confirm the I-693 medical exam is still valid — must be within 2 years of the Civil Surgeon's signature" },
    { id: "int-prep-8", label: "If the medical exam has expired or will expire before the interview, schedule a new one now" },
    { id: "int-prep-9", label: "Arrange a neutral interpreter if the beneficiary needs language assistance" },
  ],

  "interview-day": [
    { id: "iday-1", label: "Arrive at the USCIS field office at least 30 minutes early" },
    { id: "iday-2", label: "Bring the interview notice, both spouses' passports, and the organized document folder" },
    { id: "iday-3", label: "Both spouses appear before the officer together and are placed under oath" },
    { id: "iday-4", label: "Answer all questions honestly, clearly, and without hesitation" },
    { id: "iday-5", label: "If asked to answer questions separately, stay consistent with your spouse's answers" },
    { id: "iday-6", label: "Provide any missing documents the officer requests — either on the spot or by mail" },
    { id: "iday-7", label: "Ask for clarification politely if you do not understand a question" },
  ],

  "next-steps": [
    { id: "post-1", label: "If approved at interview: expect the green card by mail within 2–3 weeks" },
    { id: "post-2", label: "Monitor myUSCIS — status will show 'New Card Is Being Produced' then 'Card Was Mailed'" },
    { id: "post-3", label: "Sign the back of the green card when it arrives and keep it with you" },
    { id: "post-4", label: "If conditionally approved (CR-1, 2-year card): set a calendar reminder 90 days before expiration to file I-751" },
    { id: "post-5", label: "Present your green card to your employer and complete a new Form I-9" },
    { id: "post-6", label: "Notify the Social Security Administration of your permanent resident status" },
    { id: "post-7", label: "File Form AR-11 within 10 days if you change your address" },
    { id: "post-8", label: "In 3 years (if continuously married to a U.S. citizen), you may qualify for naturalization" },
  ],
};
