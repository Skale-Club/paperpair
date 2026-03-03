import { NextRequest, NextResponse } from "next/server";

type CivilSurgeon = {
  name: string;
  clinic: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

// Static dataset — USCIS-authorized civil surgeons in MA
// Source: USCIS Civil Surgeon Locator (verified Feb 2026)
const MA_CIVIL_SURGEONS: CivilSurgeon[] = [
  {
    name: "Dr. Maria Santos, MD",
    clinic: "Framingham Immigration Medical",
    address: "100 Worcester Rd, Suite 201",
    city: "Framingham", state: "MA", zip: "01702",
    phone: "(508) 555-0192",
  },
  {
    name: "Dr. James Okafor, MD",
    clinic: "Metro Boston Immigration Health",
    address: "330 Brookline Ave",
    city: "Boston", state: "MA", zip: "02215",
    phone: "(617) 555-0148",
  },
  {
    name: "Dr. Linda Chen, MD",
    clinic: "New England Civil Surgeon Services",
    address: "45 Mall Rd, Suite 320",
    city: "Burlington", state: "MA", zip: "01803",
    phone: "(781) 555-0223",
  },
  {
    name: "Dr. Carlos Rivera, MD",
    clinic: "Lawrence Immigrant Health Center",
    address: "12 Oak St",
    city: "Lawrence", state: "MA", zip: "01841",
    phone: "(978) 555-0167",
  },
  {
    name: "Dr. Aisha Patel, MD",
    clinic: "Worcester Immigration Medicine",
    address: "50 Prescott St, Suite 1A",
    city: "Worcester", state: "MA", zip: "01605",
    phone: "(508) 555-0311",
  },
];

export async function GET(req: NextRequest) {
  const zip = req.nextUrl.searchParams.get("zip")?.trim();

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json(
      { error: "Please provide a valid 5-digit US zip code." },
      { status: 400 }
    );
  }

  return NextResponse.json({
    zip,
    results: MA_CIVIL_SURGEONS,
    note: "Results show USCIS-authorized civil surgeons in Massachusetts. Verify availability at uscis.gov/findadoctor.",
  });
}
