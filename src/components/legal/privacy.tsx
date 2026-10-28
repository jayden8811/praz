import { legal } from "@/lib/legal";
import { site } from "@/lib/site";
import { A, Caps, H3, LegalLayout, P, UL, type LegalSection } from "./legal-layout";

const { company: C } = legal;
const privacyMail = <A href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</A>;

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/[0.08]">
      <table className="w-full min-w-[520px] border-collapse text-left text-[12px] leading-6">
        <thead className="bg-white/[0.03] text-white/90">
          <tr>
            {head.map((h) => (
              <th key={h} className="border-b border-white/[0.08] px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="align-top">
              {r.map((c, i) => (
                <td key={i} className="border-b border-white/[0.05] px-3 py-2 text-white/70">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "Who we are and what this covers",
    body: (
      <>
        <P>
          {C} (&ldquo;{C},&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides done-for-you outbound email services to
          businesses. This Privacy Policy explains how we collect, use, share, and protect personal information when you:
        </P>
        <UL
          items={[
            `visit ${legal.domain} or book a call through it;`,
            "create an account, complete onboarding, subscribe, or use the client dashboard;",
            "communicate with us by email, phone, or dashboard message; or",
            "receive an email from us that we sent on behalf of one of our business customers (we call you a \"Prospect\" in this policy).",
          ]}
        />
        <P>
          This policy does not cover how our customers handle personal information after we route an interested Prospect to them. Each
          customer is responsible for its own privacy practices. Use of our services by customers is also governed by our{" "}
          <A href={site.termsUrl}>Terms of Service</A>.
        </P>
      </>
    ),
  },
  {
    id: "collect",
    title: "Information we collect",
    body: (
      <>
        <H3>Information you give us</H3>
        <UL
          items={[
            "Account details: your email address and password. Passwords are handled by our authentication provider and stored only in hashed form; we cannot see them.",
            "Onboarding and setup details: your name, company, website, what you sell, deal size, ideal customer description, offer, proof points, sender name and title, business address, the goal you choose, and the phone number, booking link, website page, or email address where we send interested Prospects.",
            "Booking details: the name, email, company website, and notes you enter when booking a call with us.",
            "Communications: messages you send your operator in the dashboard, emails, and call notes.",
            "Billing details: your plan, billing name, email, and address. Card details are entered directly with our payment processor, Stripe. We receive only limited information such as card brand, last four digits, and expiry.",
            "Agreement records: the version of our Terms and this policy you accepted, and when.",
          ]}
        />
        <H3>Information collected automatically</H3>
        <UL
          items={[
            "Log and device data: IP address, browser type, device type, pages viewed, referring page, and timestamps, collected by our hosting provider to deliver and secure the website.",
            "Browser storage: our site stores a small amount of information in your browser, such as your sign-in session and unfinished onboarding answers, so the site works properly. We do not use advertising or cross-site tracking cookies. Our payment and scheduling providers may set cookies needed for fraud prevention and security.",
            "Campaign activity: delivery, bounce, reply, and opt-out events for Campaigns we run for you.",
          ]}
        />
        <H3>Call information</H3>
        <P>
          If a customer chooses to have Prospects call them, calls to the tracked number we provide may be logged and recorded by our call
          tracking provider. This can include the caller&apos;s phone number, approximate location derived from the number, call time,
          duration, and call audio. Callers may hear a notice that the call is recorded.
        </P>
        <H3>Information from other sources</H3>
        <P>
          To build Prospect lists for our customers, we obtain business contact information from third-party data providers and publicly
          available sources, as described in the next section.
        </P>
      </>
    ),
  },
  {
    id: "prospects",
    title: "If you received an email from us",
    body: (
      <>
        <P>
          We send business-to-business emails on behalf of our customers to people whose roles suggest they may be interested in our
          customers&apos; products or services. To do this we process business contact information such as your name, job title, employer,
          business email address, business phone number, professional profile URL, company details such as industry and size, and general
          location such as city, state, or country. We obtain this information from commercial data providers that compile business
          contact data, and from public sources such as company websites and professional profiles.
        </P>
        <P>
          We use this information only to send relevant business messages, to measure delivery and replies, to route your reply to the
          customer you expressed interest in, and to honor opt-outs. If you reply with interest, we share your reply and contact details
          with that customer so they can follow up. We do not send messages to personal email addresses for consumer marketing.
        </P>
        <P>
          <b className="font-medium text-white">To stop receiving these emails,</b> reply with &ldquo;unsubscribe&rdquo; or email{" "}
          {privacyMail}. We will add your email address to a suppression list so you are not contacted again through our services. We keep
          the minimum information needed to make sure the suppression is honored.
        </P>
        <P>
          You also have the privacy rights described below, including the right to know what we hold about you, to have it corrected, and
          to have it deleted.
        </P>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use information",
    body: (
      <UL
        items={[
          "To provide the services: build Prospect lists, set up sending domains and inboxes, write and run Campaigns, handle replies, route interested Prospects, track calls, and show results in the dashboard.",
          "To create and secure accounts, authenticate users, and prevent fraud, abuse, and spam.",
          "To process payments, manage subscriptions, and keep financial records.",
          "To schedule and hold calls you book with us.",
          "To communicate with you about your account, Campaigns, billing, changes to our terms, and support requests.",
          "To send you information about our own services, which you can opt out of at any time.",
          "To monitor deliverability, measure performance, and improve our services, including using aggregated or de-identified data.",
          "To comply with law, respond to lawful requests, enforce our Terms, and protect the rights, safety, and property of Praz, our customers, Prospects, and others.",
        ]}
      />
    ),
  },
  {
    id: "legal-bases",
    title: "Legal bases for processing (EEA and UK)",
    body: (
      <>
        <P>If you are in the European Economic Area or the United Kingdom, we rely on these legal bases:</P>
        <UL
          items={[
            "Contract: to provide the services you sign up for and manage your account and subscription.",
            "Legitimate interests: to operate and improve our services, send relevant business-to-business outreach on behalf of customers, prevent fraud and abuse, and secure our systems. We balance these interests against your rights, and you can object at any time.",
            "Consent: where the law requires it, such as for certain electronic marketing. You can withdraw consent at any time.",
            "Legal obligation: to keep records and respond to lawful requests.",
          ]}
        />
      </>
    ),
  },
  {
    id: "share",
    title: "How we share information",
    body: (
      <>
        <P>We share personal information only as described here:</P>
        <UL
          items={[
            "Service providers who process information for us under contracts that limit their use of it, including hosting, authentication and database, payment processing (Stripe), scheduling, call tracking, email and mailbox providers, sending and data platforms, and customer support tools.",
            "Our customers: when a Prospect replies with interest or calls a tracked number, we share the reply, contact details, and call information with the customer the Prospect contacted.",
            "Professional advisers, such as lawyers, accountants, and auditors, under duties of confidentiality.",
            "Legal and safety: when we believe disclosure is required by law, subpoena, or legal process, or is needed to protect rights, safety, or property, or to investigate fraud or abuse.",
            "Business transfers: in connection with a merger, acquisition, financing, reorganization, or sale of assets, subject to this policy.",
            "With your direction or consent.",
          ]}
        />
        <P>
          We do not sell personal information for money, and we do not share personal information for cross-context behavioral
          advertising.
        </P>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies, browser storage and signals",
    body: (
      <P>
        We use only the cookies and browser storage needed to run the site, keep you signed in, remember unfinished onboarding answers,
        and protect against fraud. We do not use third-party advertising cookies. Because we do not track you across other sites, we
        do not respond differently to Do Not Track signals, and we treat Global Privacy Control signals as a request to opt out of any
        sale or sharing of personal information. You can clear browser storage at any time in your browser settings, though some parts
        of the site may not work without it.
      </P>
    ),
  },
  {
    id: "retention",
    title: "How long we keep information",
    body: (
      <>
        <P>We keep personal information only as long as needed for the purposes in this policy, including:</P>
        <UL
          items={[
            "Account and onboarding information: for the life of your account, and up to 24 months after it closes so we can handle questions, disputes, and reactivation, unless you ask us to delete it sooner.",
            "Billing and transaction records: up to 7 years, as required for tax and accounting.",
            "Call recordings and call logs: generally up to 12 months, unless a customer asks us to delete them sooner or longer retention is needed for a dispute.",
            "Prospect information: while it remains useful for our customers' Campaigns, generally no longer than 24 months after we last use it.",
            "Suppression lists: indefinitely, so that people who opted out are not contacted again.",
            "Records of agreement to our Terms and this policy: for as long as needed to prove the agreement.",
          ]}
        />
        <P>When we no longer need information, we delete it or de-identify it so it can no longer be linked to you.</P>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <P>
        We use administrative, technical, and physical safeguards designed to protect personal information, including encryption in
        transit, hashed passwords, access controls, and reputable infrastructure providers. No method of transmission or storage is
        completely secure, so we cannot guarantee absolute security. You are responsible for keeping your password confidential. If we
        learn of a security incident affecting your personal information, we will notify you as required by law.
      </P>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    body: (
      <P>
        We are based in the United States, and our service providers may process information in the United States and other countries.
        These countries may have data protection laws different from those where you live. When we transfer personal information from
        the EEA, UK, or Switzerland, we use appropriate safeguards such as the European Commission&apos;s Standard Contractual Clauses and
        the UK Addendum, or rely on an adequacy decision or another lawful transfer mechanism.
      </P>
    ),
  },
  {
    id: "rights",
    title: "Your rights and choices",
    body: (
      <>
        <P>Depending on where you live, you may have the right to:</P>
        <UL
          items={[
            "know what personal information we hold about you and get a copy of it;",
            "correct inaccurate information;",
            "delete your information;",
            "receive your information in a portable format;",
            "object to or restrict certain processing, including processing based on legitimate interests;",
            "opt out of marketing emails and of any sale, sharing, or targeted advertising (we do not do these);",
            "withdraw consent where we rely on it; and",
            "appeal our decision about your request.",
          ]}
        />
        <P>
          To make a request, email {privacyMail} from the email address in question, or tell us which address the request is about. We will
          verify your request, which may include asking you to confirm control of the email address, and respond within the time the law
          requires, usually 30 or 45 days. You may use an authorized agent, who must provide proof of authority. If we deny your request,
          you can appeal by replying to our decision, and you can contact your local data protection authority. We will not discriminate
          against you for exercising your rights.
        </P>
        <P>
          Some information may be exempt, for example where we must keep it to comply with law, complete a transaction, prevent fraud, or
          honor an opt-out. Requests about information a customer holds after we routed a Prospect to them should be sent to that customer.
        </P>
      </>
    ),
  },
  {
    id: "us-states",
    title: "U.S. state privacy disclosures",
    body: (
      <>
        <P>
          This section supplements the policy for residents of California and other U.S. states with comprehensive privacy laws. In the
          past 12 months we have collected the following categories of personal information, from the sources and for the purposes
          described above, and disclosed them for business purposes to the recipients described in &ldquo;How we share information.&rdquo;
        </P>
        <Table
          head={["Category", "Examples", "Disclosed to"]}
          rows={[
            ["Identifiers", "Name, email, phone number, IP address, account ID", "Service providers; customers (for Prospects)"],
            ["Customer records", "Billing name and address, limited card details", "Payment processor; service providers"],
            ["Commercial information", "Plan, subscription and transaction history", "Payment processor; service providers"],
            ["Internet activity", "Pages viewed, interactions with the site and dashboard", "Hosting and security providers"],
            ["Approximate geolocation", "City or region from IP address or phone number", "Service providers; customers (for calls)"],
            ["Audio information", "Call recordings on tracked numbers", "Call tracking provider; the customer called"],
            ["Professional information", "Job title, employer, company details", "Service providers; customers (for Prospects)"],
            ["Account login", "Email and password (stored hashed)", "Authentication provider"],
          ]}
        />
        <P>
          We use account login information only to provide and secure your account. We do not sell or share personal information as those
          terms are defined under California law, and we have no actual knowledge of selling or sharing personal information of anyone
          under 16. We do not use sensitive personal information to infer characteristics about anyone.
        </P>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <P>
        Our services are for businesses and are not directed to anyone under 18. We do not knowingly collect personal information from
        children. If you believe a child has given us personal information, contact {privacyMail} and we will delete it.
      </P>
    ),
  },
  {
    id: "third-party-links",
    title: "Third-party sites and services",
    body: (
      <P>
        Our site links to and integrates with third-party services, such as our payment processor and scheduling provider. Information
        you give directly to those services is governed by their privacy policies, not this one. We are not responsible for the practices
        of third parties.
      </P>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <P>
        We may update this policy from time to time. We will post the updated version on this page with a new effective date and, for
        material changes, notify account holders by email or in the dashboard before the changes take effect.
      </P>
    ),
  },
  {
    id: "contact",
    title: "Contact us",
    body: (
      <>
        <P>
          For privacy questions or requests, email {privacyMail}. For anything else, email{" "}
          <A href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</A>.
        </P>
        <Caps>If you received an email from us and want no further contact, reply &ldquo;unsubscribe&rdquo; or email {legal.privacyEmail}.</Caps>
      </>
    ),
  },
];

export function Privacy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what personal information {C} collects, why, who we share it with, and the choices you have, including
          how to stop receiving emails we send on behalf of our customers.
        </p>
      }
      sections={sections}
    />
  );
}
