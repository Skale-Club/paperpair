/** @module interview-questions */

/** A single USCIS interview practice question with an answer tip. */
export type InterviewQuestion = {
  id: string;
  category:
    | "Relationship History"
    | "Daily Life & Cohabitation"
    | "Personal & Immigration History"
    | "Forms & Documents";
  question: string;
  answerTip: string;
};

/** All valid filter categories for the interview prep page, including the "All" catch-all. */
export const CATEGORIES = [
  "All",
  "Relationship History",
  "Daily Life & Cohabitation",
  "Personal & Immigration History",
  "Forms & Documents",
] as const;

export type Category = (typeof CATEGORIES)[number];

/** 30 USCIS interview practice questions distributed across 4 categories. */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  // --- Relationship History (8 questions) ---
  {
    id: "rh-01",
    category: "Relationship History",
    question: "How and where did you two first meet?",
    answerTip:
      "Be specific about the date, location, and circumstances. Mention if you were introduced by someone or met online, and who initiated the first contact.",
  },
  {
    id: "rh-02",
    category: "Relationship History",
    question: "Describe your first date.",
    answerTip:
      "Where did you go? What did you do? Try to remember small details like what you ate or what you talked about.",
  },
  {
    id: "rh-03",
    category: "Relationship History",
    question: "Who proposed to whom, and how did it happen?",
    answerTip:
      "Where were you? Was there a ring? Who else knew about it beforehand? Both spouses should align on the key details.",
  },
  {
    id: "rh-04",
    category: "Relationship History",
    question: "How many people attended your wedding?",
    answerTip:
      "Be prepared to name some of the guests, especially family members on both sides. Know where the ceremony and reception were held.",
  },
  {
    id: "rh-05",
    category: "Relationship History",
    question: "When and how did you decide you wanted to get married?",
    answerTip:
      "Officers look for a natural progression of the relationship. Describe the conversation or moment you both knew this was serious.",
  },
  {
    id: "rh-06",
    category: "Relationship History",
    question: "What was the first trip you took together as a couple?",
    answerTip:
      "Name the destination, approximate dates, and what you did there. Shared travel is strong bona fide evidence.",
  },
  {
    id: "rh-07",
    category: "Relationship History",
    question: "How did you tell your families about your relationship?",
    answerTip:
      "Be specific — who did you tell first, when, and how did they react? Officers appreciate specific anecdotes over vague answers.",
  },
  {
    id: "rh-08",
    category: "Relationship History",
    question: "What was the name of the venue where your wedding was held?",
    answerTip:
      "Know the name, city, and state of both the ceremony and reception venue. Have the address ready if asked.",
  },

  // --- Daily Life & Cohabitation (8 questions) ---
  {
    id: "dl-01",
    category: "Daily Life & Cohabitation",
    question: "Who usually cooks in the relationship? What did you eat for dinner last night?",
    answerTip:
      "Officers ask mundane daily life questions to ensure you actually live together and share a routine. Answer honestly and specifically.",
  },
  {
    id: "dl-02",
    category: "Daily Life & Cohabitation",
    question: "What are your spouse's parents' names?",
    answerTip:
      "You should know the full names of your spouse's immediate family, including parents and siblings. Middle names are not required.",
  },
  {
    id: "dl-03",
    category: "Daily Life & Cohabitation",
    question: "What is your morning routine like? Who wakes up first?",
    answerTip:
      "Describe a typical weekday morning in detail. Officers use these questions to confirm you genuinely share a household.",
  },
  {
    id: "dl-04",
    category: "Daily Life & Cohabitation",
    question: "Who handles the household bills and finances?",
    answerTip:
      "Explain how you split or share financial responsibilities. Joint bank accounts and shared bills are supporting evidence here.",
  },
  {
    id: "dl-05",
    category: "Daily Life & Cohabitation",
    question: "What side of the bed does your spouse sleep on?",
    answerTip:
      "This is a classic cohabitation question. Know the answer to this and similar small-detail questions — they confirm you live together.",
  },
  {
    id: "dl-06",
    category: "Daily Life & Cohabitation",
    question: "Describe the layout of your home (number of rooms, floors, etc.).",
    answerTip:
      "Be able to describe your home's floor plan from memory: how many bedrooms and bathrooms, which floor you live on, and key features.",
  },
  {
    id: "dl-07",
    category: "Daily Life & Cohabitation",
    question: "What time does your spouse typically wake up on weekdays?",
    answerTip:
      "Know your spouse's daily schedule, including wake-up time, work hours, and any regular commitments like gym or commute.",
  },
  {
    id: "dl-08",
    category: "Daily Life & Cohabitation",
    question: "Who takes out the trash or handles household chores?",
    answerTip:
      "Describe how you divide household duties. Even informal arrangements count — the point is that you share a domestic life.",
  },

  // --- Personal & Immigration History (7 questions) ---
  {
    id: "pi-01",
    category: "Personal & Immigration History",
    question: "What is your spouse's date of birth?",
    answerTip:
      "Know the exact date — month, day, and year. This is one of the most basic identity questions and both spouses will be asked.",
  },
  {
    id: "pi-02",
    category: "Personal & Immigration History",
    question: "Where was your spouse born? What city and country?",
    answerTip:
      "Know the city and country of birth for your spouse. If they were born in a smaller city, be prepared to name the province or region.",
  },
  {
    id: "pi-03",
    category: "Personal & Immigration History",
    question: "Have you traveled outside the U.S. together since filing?",
    answerTip:
      "If yes, name the countries, approximate dates, and purpose. If no, state that clearly. Unauthorized travel while I-485 is pending is a serious issue.",
  },
  {
    id: "pi-04",
    category: "Personal & Immigration History",
    question: "Where does your spouse work? What is their job title?",
    answerTip:
      "Know the employer's name, address, and your spouse's role. If self-employed, know the business name and type of work.",
  },
  {
    id: "pi-05",
    category: "Personal & Immigration History",
    question: "How long has the beneficiary been in the United States?",
    answerTip:
      "Know the exact date of the beneficiary's last entry and the visa type they entered on. Check the I-94 record for accuracy.",
  },
  {
    id: "pi-06",
    category: "Personal & Immigration History",
    question: "Has the beneficiary ever been in removal (deportation) proceedings?",
    answerTip:
      "Answer honestly. If proceedings occurred in the past, you should have consulted an attorney. Do not guess or minimize the history.",
  },
  {
    id: "pi-07",
    category: "Personal & Immigration History",
    question: "What visa did the beneficiary enter the U.S. on?",
    answerTip:
      "Know the exact visa type (e.g., B-2 tourist, F-1 student, J-1 exchange visitor) and the date of entry. Match your I-94 record exactly.",
  },

  // --- Forms & Documents (7 questions) ---
  {
    id: "fd-01",
    category: "Forms & Documents",
    question: "What are the main forms you filed together for this case?",
    answerTip:
      "Be able to name I-130, I-485, I-131, and I-765 by form number. Know that I-130 is the petition and I-485 is the adjustment application.",
  },
  {
    id: "fd-02",
    category: "Forms & Documents",
    question: "What is Form I-485 for?",
    answerTip:
      "I-485 is the Application to Register Permanent Residence — it is the core form the beneficiary files to adjust their immigration status to lawful permanent resident.",
  },
  {
    id: "fd-03",
    category: "Forms & Documents",
    question: "Who signs Form I-864 (Affidavit of Support), and what does it mean?",
    answerTip:
      "The petitioner (U.S. citizen spouse) signs the I-864. It is a legally binding promise that the petitioner will financially support the beneficiary above 125% of the federal poverty level.",
  },
  {
    id: "fd-04",
    category: "Forms & Documents",
    question: "What is Form I-693, and why is it required?",
    answerTip:
      "I-693 is the Report of Medical Examination and Vaccination Record, completed by a USCIS-approved civil surgeon. It confirms the beneficiary meets health requirements for permanent residence.",
  },
  {
    id: "fd-05",
    category: "Forms & Documents",
    question: "When was your I-130 petition filed?",
    answerTip:
      "Know the approximate date you submitted the I-130. Check your receipt notice (I-797C) for the exact date. Both spouses should have consistent answers.",
  },
  {
    id: "fd-06",
    category: "Forms & Documents",
    question: "What is your USCIS receipt number, and where do you find it?",
    answerTip:
      "The receipt number is on the I-797C Notice of Action. It starts with a 3-letter code (e.g., MSC, EAC) followed by 10 digits. You can track your case with it on myUSCIS.",
  },
  {
    id: "fd-07",
    category: "Forms & Documents",
    question: "What supporting documents did you submit with your packet?",
    answerTip:
      "Be ready to list: marriage certificate, birth certificates, passport copies, photos, joint financial evidence (bank statements, lease), and the I-864 with financial evidence.",
  },
];
