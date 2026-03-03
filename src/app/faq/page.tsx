import type { ReactNode } from "react";

type Alert = {
  title: string;
  body: string;
};

type FaqSection = {
  title: string;
  body: ReactNode;
};

const alerts: Alert[] = [
  {
    title: "Alert: Litigation update on Ms. L. v. ICE and applicability of certain HR-1 fees",
    body:
      "Pending litigation may affect whether specific HR-1 fees apply. Confirm the current instructions for your form before submitting any payment."
  },
  {
    title:
      "Alert: USCIS no longer accepts personal or business checks, money orders, or cashier’s checks for most paper filings unless you qualify for an exemption",
    body:
      "For paper filings, pay with a credit, debit, or prepaid card using Form G-1450 or with an ACH withdrawal using Form G-1650. Exemption requests use Form G-1651. USCIS still accepts payments through Pay.gov for online filings."
  }
];

const faqSections: FaqSection[] = [
  {
    title: "Filing guidance overview",
    body: (
      <div className="space-y-2">
        <p>
          Filing locations, checklists, and tips in one place. For the full list of USCIS forms, use the official All Forms page.
        </p>
        <p>
          Always confirm filing location and payment method in the form instructions before you submit to avoid delays or rejections.
        </p>
      </div>
    )
  },
  {
    title: "Where to file",
    body: (
      <div className="space-y-2">
        <p>
          Each form page explains how to complete it and where to file. Do not mail any application to an “HQPDI” address—that address is only for public comments.
        </p>
        <p className="font-semibold">Forms with dedicated filing-address pages include:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>I-102, I-129, I-129F, I-130, I-131</li>
          <li>I-140, I-212, I-290B, I-360</li>
          <li>I-485, I-601, I-751</li>
          <li>I-765, I-817, I-821D, I-824</li>
        </ul>
        <p>Use the correct fee and office to prevent processing delays.</p>
      </div>
    )
  },
  {
    title: "Instructions and checklists",
    body: (
      <div className="space-y-2">
        <p>Read the form instructions before completing and submitting. Special Instructions on the form page supersede older PDFs.</p>
        <p>Checklists on form pages help you gather required documents but do not replace the official instructions.</p>
      </div>
    )
  },
  {
    title: "Filing tips and requirements",
    body: (
      <div className="space-y-2">
        <p>Follow photographic specifications listed in the form instructions.</p>
        <p className="font-semibold">Helpful filing tip pages:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>General Form Filing Tips</li>
          <li>I-924A Annual Certification (regional centers)</li>
          <li>I-864A and I-864 Affidavit of Support tip sheets (including I-864EZ)</li>
          <li>I-360 filing tips</li>
          <li>N-600K application tip sheet</li>
        </ul>
      </div>
    )
  },
  {
    title: "FBI privacy notice (biometrics)",
    body: (
      <div className="space-y-2">
        <p>
          USCIS may use biometrics for identity verification, eligibility decisions, and document production. You can request your own FBI record using the process in 28 CFR 16.30-16.34.
        </p>
        <p>See the FBI privacy resources for how fingerprints are used and your rights.</p>
      </div>
    )
  },
  {
    title: "Downloading and printing immigration forms",
    body: (
      <div className="space-y-2">
        <p>Forms are free, fillable PDFs. For best results, save locally and complete using the latest Adobe Acrobat Reader.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Edge: use the Save icon or press Ctrl/Cmd+S, then reopen in Acrobat.</li>
          <li>Chrome/Firefox: use the Download icon or Ctrl/Cmd+S; disable Acrobat PDF extension if errors appear.</li>
          <li>Safari: hover to show the download control or press Cmd+S, then open in Acrobat.</li>
        </ul>
        <p>Ensure edition date and page numbers are visible and all pages match the same edition. Hand-sign any form that requires a signature; stamped or typed signatures are not accepted.</p>
        <p>Do not pay for USCIS forms from third-party sites; using outdated forms can delay or reject your case.</p>
      </div>
    )
  },
  {
    title: "“DS” forms and other non-USCIS forms",
    body: (
      <div className="space-y-2">
        <p>
          Visa and passport-related “DS” forms are on the Department of State site. Form I-94 information is on U.S. Customs and Border Protection. Those forms are not hosted on USCIS.gov.
        </p>
      </div>
    )
  },
  {
    title: "Related resources",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>Before you file: Filing Fees; Expedite Criteria; “DS” forms links</li>
        <li>After you file: Form I-797 notice types; biometrics appointment prep; address change process</li>
        <li>Delivery tracking for cards/documents; handling non-delivery or typographic errors</li>
      </ul>
    )
  },
  {
    title: "Our fees",
    body: (
      <ul className="list-disc space-y-2 pl-5">
        <li>USCIS periodically adjusts filing fees; rely on the official Fee Schedule for current amounts.</li>
        <li>Use the Fee Calculator to determine the exact fee for your form; incorrect fees lead to rejection.</li>
      </ul>
    )
  },
  {
    title: "How to pay USCIS filing fees",
    body: (
      <div className="space-y-2">
        <p>
          How you pay depends on where you file. Most forms require a fee; submitting the wrong amount will result in a rejection.
        </p>
        <p>
          If you live outside the United States or its territories and want to file where you live, check the form instructions to see if international filing is allowed. Confirm accepted payment types with the relevant USCIS international office or U.S. embassy/consulate.
        </p>
        <p>
          If you are inside the United States, payment options depend on the form: online card or ACH payment, or by mail with Form G-1450 (card) or Form G-1650 (ACH). Paper fee payment exemptions use Form G-1651.
        </p>
        <p>
          Emergency advance parole on Form I-131 requires a Contact Center appointment. In-person payments at a field office may be made with Form G-1450 (card) or Form G-1650 (ACH), or with a single check if you qualify for the paper-based exemption. Field office payments cannot be split across multiple cards.
        </p>
        <p>
          Before mailing, review the “What and How to Pay” guidance to ensure you are using the correct payment method for the USCIS Lockbox handling your package.
        </p>
      </div>
    )
  },
  {
    title: "Multiple applications or methods of payment",
    body: (
      <div className="space-y-2">
        <p>
          Provide a separate payment for each benefit request to avoid rejection of an entire package when one application has an error.
        </p>
        <p>
          Different forms may be processed in different systems; combined payments across forms can force USCIS to reject the whole package.
        </p>
        <p>Each benefit request must use a single payment method (one card or one ACH withdrawal).</p>
        <p>USCIS may reject a package if you mix Forms G-1450 and G-1650 in the same packet, omit the account type or account kind on Form G-1650, authorize the wrong amount, or provide incorrect routing/account numbers.</p>
        <p>
          Examples: one request with one card uses a single Form G-1450; one request split across two cards uses two Forms G-1450 whose amounts add to the exact fee; three requests paid by one card require three Forms G-1450 (one per request); combining card and ACH for different requests means separate packages for each payment type.
        </p>
      </div>
    )
  },
  {
    title: "Pay with a U.S. bank account – ACH transaction",
    body: (
      <div className="space-y-2">
        <p>Only U.S. bank accounts are accepted. Ensure daily limits and funds cover the fee.</p>
        <p>ACH payments are accepted at Lockboxes, service centers, and field offices. Submit a separate payment for each benefit request.</p>
        <p>
          Complete and sign Form G-1650 (Authorization for ACH Transactions) and place it on top of the request. You may split a single form’s payment across multiple accounts when filing with a Lockbox or Service Center by submitting one G-1650 per account. Do not combine ACH with card payments for the same form.
        </p>
        <p>
          Form G-1650 must indicate business/personal, checking/savings, correct routing and account numbers, and the exact amount. Incorrect or incomplete details lead to rejection.
        </p>
        <p>
          Declined ACH for insufficient funds is re-submitted once; any other decline results in rejection with no reattempt.
        </p>
        <p>
          If your bank uses an ACH debit block, whitelist USCIS using the correct Agency Location Code (ALC): Phoenix/Tempe 7001010330; Dallas/Lewisville 7001010331; Chicago 7001010335; Elgin/Carol Stream 7001010390; Montclair, CA 700101031F; Bloomington, MN 700101031J; other USCIS offices 700101031B, 700101031D, 700101031E, 7001010333, 7001010325, 7001010326, 7001010327, 7001010328, 7001010329, 7001010371, 7001010372, 70010103X5.
        </p>
      </div>
    )
  },
  {
    title: "Pay with a credit or debit card",
    body: (
      <div className="space-y-2">
        <p>Visa, MasterCard, American Express, Discover, and prepaid cards from U.S. banks are accepted. Gift cards and foreign bank cards are not accepted.</p>
        <p>Pay online through Pay.gov or by mail with Form G-1450. A separate payment per benefit request is recommended.</p>
        <p>
          Daily card limit is $24,999.99 per card; H-1B registrations/petitions filed online may use up to $99,999.99 on one card. Ensure credit limits cover the fee—declined cards are not retried and filings are rejected.
        </p>
        <p>
          Splitting one form across multiple cards is allowed for Lockbox or Service Center filings with one Form G-1450 per card whose totals equal the exact fee. Emergency advance parole paid in person at a field office must use a single card and a single Form G-1450.
        </p>
      </div>
    )
  },
  {
    title: "How to request an exemption for paper fee payment",
    body: (
      <div className="space-y-2">
        <p>Paper-based payments are generally not accepted. Request an exemption with Form G-1651 only if you:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Do not have access to banking services or electronic payment systems;</li>
          <li>Would face undue hardship with electronic disbursement (31 C.F.R. Part 208);</li>
          <li>Need non-electronic payment for national security or law enforcement reasons; or</li>
          <li>Qualify under other Treasury-authorized circumstances.</li>
        </ul>
        <p>
          Mail Form G-1651 with your payment and benefit request to the correct filing location. Do not mix a paper payment with any electronic payment in the same package.
        </p>
        <p>
          If approved, you may pay with a bank draft, cashier’s check, certified check, personal/business check, or money order drawn on a U.S. financial institution, in U.S. funds, payable to “U.S. Department of Homeland Security,” and dated within the past 365 days.
        </p>
        <p>
          For Form I-131 filed directly at a field office for emergency advance parole, you must use a single credit/debit card (Form G-1450), a single ACH payment (Form G-1650), or a single check if exempt; splitting is not allowed.
        </p>
        <p>
          Check-writing basics: the check must be preprinted with your name and bank’s name; date in MM/DD/YYYY; include the exact numeric and written amount; list the purpose (for example, “N-400 application”); include the applicant name in the memo if needed; sign in ink; and ensure the check is dated within 365 days.
        </p>
        <p>
          By submitting a check, you authorize conversion to an electronic funds transfer. Unpayable checks are reprocessed once; a second return may lead to rejection.
        </p>
      </div>
    )
  },
  {
    title: "If you file online",
    body: (
      <div className="space-y-2">
        <p>
          The online system guides you through paying with a card or bank withdrawal and directs you to the secure Department of the Treasury Pay.gov site to complete payment. Always confirm the website address and beware of scam sites; current USCIS forms are free at uscis.gov/forms.
        </p>
      </div>
    )
  },
  {
    title: "If you file by mail",
    body: (
      <div className="space-y-2">
        <p>Choose one payment method per package.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>For card payments, complete and sign Form G-1450.</li>
          <li>For ACH payments, complete and sign Form G-1650.</li>
          <li>Use the same payment form type for each request in the package; mixing G-1450 and G-1650 may result in rejection.</li>
          <li>Place the payment form on top of your application, petition, or request and mail to the correct USCIS Lockbox.</li>
        </ul>
        <p>If accepted, USCIS will charge your card or account for the proper amount.</p>
      </div>
    )
  },
  {
    title: "Unfunded or dishonored payments",
    body: (
      <div className="space-y-2">
        <p>
          If a petition, application, or request is approved but the payment is not properly funded or is later disputed, USCIS may revoke, rescind, or cancel the approval after notice (for example, by issuing a Notice of Intent to Revoke). USCIS does not issue separate bills for unpaid fees.
        </p>
      </div>
    )
  },
  {
    title: "Refund policy",
    body: (
      <div className="space-y-2">
        <p>
          Filing and biometric service fees are final and nonrefundable regardless of the action USCIS takes on your filing or if you withdraw. Refer to your form instructions or contact the USCIS Contact Center for questions.
        </p>
      </div>
    )
  },
  {
    title: "Fee waiver guidance",
    body: (
      <div className="space-y-2">
        <p>
          Fee waivers are available only for certain forms and benefit types when you clearly demonstrate inability to pay. Each request is evaluated on its merits; see the USCIS guidance on filing a fee waiver for details.
        </p>
      </div>
    )
  },
  {
    title: "Security, third-party payments, and rejection notices",
    body: (
      <div className="space-y-2">
        <p>
          USCIS uses the U.S. Department of the Treasury’s Pay.gov Trusted Collections Service, which is PCI DSS compliant. Fees cannot be paid directly to Pay.gov.
        </p>
        <p>
          Third parties may pay on your behalf; the account holder must complete and sign Form G-1450 or G-1650 and give it to you to file.
        </p>
        <p>
          If USCIS rejects your filing, you will receive a notice explaining why. When refiling with a credit card, include a new Form G-1450; for ACH, include a new Form G-1650.
        </p>
      </div>
    )
  },
  {
    title: "Avoid immigration scams",
    body: (
      <div className="space-y-2">
        <p>
          Learn how to recognize and report immigration services fraud at the USCIS “Avoid Scams” page. Remember that the current versions of USCIS forms are always available for free at uscis.gov/forms.
        </p>
      </div>
    )
  }
];

function AccordionItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-2xl border border-sand-200 bg-white shadow-sm transition-[border-color,box-shadow] duration-200 open:border-primary/60 open:shadow-md">
      <summary className="flex cursor-pointer items-start justify-between gap-3 px-4 py-3 text-left text-base font-semibold text-foreground">
        <span>{title}</span>
        <span
          aria-hidden
          className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-sand-300 text-primary transition-transform duration-200 group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="space-y-3 border-t border-sand-200 px-4 py-4 text-sm leading-6 text-slate-700">{children}</div>
    </details>
  );
}

export default function FaqPage() {
  return (
    <section className="space-y-8 rounded-3xl border border-sand-200 bg-sand-50/80 p-6 shadow-sm md:p-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Filing fees</p>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Filing Fees &amp; Payment FAQ</h1>
        <p className="max-w-3xl text-base text-slate-700">
          Centralized answers on USCIS filing fees, payment methods, exemptions, and recent alerts. Use this page before you submit a package to avoid rejections for payment issues.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {alerts.map((alert) => (
          <article key={alert.title} className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Alert type</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{alert.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{alert.body}</p>
          </article>
        ))}
      </div>

      <div className="space-y-3">
        {faqSections.map((section) => (
          <AccordionItem key={section.title} title={section.title}>
            {section.body}
          </AccordionItem>
        ))}
      </div>
    </section>
  );
}
