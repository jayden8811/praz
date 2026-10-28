import { legal } from "@/lib/legal";
import { site } from "@/lib/site";
import { A, Caps, H3, LegalLayout, P, UL, type LegalSection } from "./legal-layout";

const { company: C } = legal;

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreement to these Terms",
    body: (
      <>
        <P>
          These Terms of Service (the &ldquo;Terms&rdquo;) form a binding agreement between {C} (&ldquo;{C},&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;) and the business that creates an account, submits an onboarding form, books a call,
          starts a subscription, or otherwise uses our website at {legal.domain}, our client dashboard, or any of our services
          (&ldquo;Customer,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;).
        </P>
        <P>
          You accept these Terms by checking the box that references them, by creating an account, by paying for a subscription, or
          by using the Services, whichever happens first. If you are accepting on behalf of a company or other legal entity, you
          represent and warrant that you have authority to bind that entity, and &ldquo;you&rdquo; refers to that entity. If you do
          not have that authority, or do not agree to these Terms, you may not use the Services.
        </P>
        <P>
          Our <A href={site.privacyUrl}>Privacy Policy</A> explains how we handle personal information and is incorporated into these
          Terms by reference. Any order form, proposal, or written statement of work we sign with you (an &ldquo;Order&rdquo;) is also
          part of this agreement. If an Order conflicts with these Terms, the Order controls only for the specific conflicting term
          and only for that Order.
        </P>
      </>
    ),
  },
  {
    id: "definitions",
    title: "Definitions",
    body: (
      <UL
        items={[
          <>
            <b className="font-medium text-white">&ldquo;Services&rdquo;</b> means our done-for-you outbound services, including
            prospect list building, data verification, sending domain and inbox setup, inbox warmup, copywriting, campaign management,
            reply handling, routing interested prospects to you, reporting, the client dashboard, and any related support.
          </>,
          <>
            <b className="font-medium text-white">&ldquo;Campaign&rdquo;</b> means any email outreach we run on your behalf.
          </>,
          <>
            <b className="font-medium text-white">&ldquo;Prospect&rdquo;</b> means any person or business that a Campaign targets or
            contacts, and <b className="font-medium text-white">&ldquo;Prospect Data&rdquo;</b> means information about Prospects.
          </>,
          <>
            <b className="font-medium text-white">&ldquo;Customer Content&rdquo;</b> means everything you give us or approve, including
            your offer, claims, proof points, case studies, logos, sender details, landing pages, phone numbers, booking links, and
            instructions.
          </>,
          <>
            <b className="font-medium text-white">&ldquo;Sending Infrastructure&rdquo;</b> means the domains, mailboxes, DNS records,
            tracked phone numbers, and related accounts we set up or use to operate Campaigns.
          </>,
          <>
            <b className="font-medium text-white">&ldquo;Third-Party Services&rdquo;</b> means software, data, and infrastructure
            provided by companies other than {C}, such as data providers, email and mailbox providers, sending platforms, call tracking
            providers, scheduling tools, payment processors, and hosting providers.
          </>,
          <>
            <b className="font-medium text-white">&ldquo;Applicable Law&rdquo;</b> means all laws, regulations, and binding industry
            rules that apply to you, your business, your offer, or the Campaigns, in every place where Prospects are located.
          </>,
        ]}
      />
    ),
  },
  {
    id: "eligibility",
    title: "Business use only",
    body: (
      <>
        <P>
          The Services are offered only to businesses and professionals acting for business purposes. You represent that you are not
          a consumer, that you are at least 18 years old, and that you are acting in the course of a trade, business, or profession.
          Consumer protection laws that apply only to consumers do not apply to this agreement to the fullest extent permitted by law.
        </P>
        <P>
          We may decline to work with any business for any lawful reason, including deal size, industry, offer, reputation,
          deliverability risk, or legal risk, and we may require additional information before starting work.
        </P>
      </>
    ),
  },
  {
    id: "services",
    title: "The Services",
    body: (
      <>
        <P>
          We will use commercially reasonable efforts to provide the Services described on our website and in your plan. We decide the
          methods, tools, vendors, staff, schedules, and sequencing we use to deliver the Services. We may change, improve, add, or
          remove features or vendors at any time, as long as the overall Services you pay for are not materially reduced during your
          current paid billing period.
        </P>
        <P>
          Daily sending volumes are targets, not commitments. New domains and inboxes must be warmed up before they reach full volume,
          and we may reduce, pause, or reschedule sending at any time to protect deliverability, respond to complaints or bounces,
          comply with mailbox provider rules or Applicable Law, or protect our Sending Infrastructure. Launch timelines are estimates
          and depend on you providing complete information and any approvals we request.
        </P>
        <P>
          Any operator, strategist, or team member we assign may change over time. The Services do not include legal, tax,
          accounting, financial, or regulatory advice, and nothing we say or produce is such advice.
        </P>
      </>
    ),
  },
  {
    id: "customer-information",
    title: "Information you provide",
    body: (
      <>
        <P>
          You must give us accurate, complete, and current information during onboarding and throughout your subscription, and update
          it promptly if it changes. This includes your company details, ideal customer, offer, claims, sender identity, business
          address, phone numbers, booking links, and website pages. We rely on this information without independent verification.
          We are not responsible for delays, poor results, or any harm caused by information that is inaccurate, incomplete, outdated,
          or unlawful.
        </P>
        <P>
          You represent that you own or have all rights, licenses, and permissions needed for us to use Customer Content as described in
          these Terms, and that Customer Content does not infringe, misappropriate, or violate anyone&apos;s rights or any Applicable Law.
        </P>
      </>
    ),
  },
  {
    id: "compliance",
    title: "Your compliance responsibilities",
    body: (
      <>
        <P>
          Campaigns are sent to promote your business, your products, and your services, under a sender identity and business address
          you provide or approve. As between you and us, you are the sender, initiator, and advertiser of every Campaign message for
          purposes of Applicable Law, and we act as your service provider. You are solely responsible for ensuring that your business,
          your offer, Customer Content, and the Campaigns comply with Applicable Law, including, as applicable:
        </P>
        <UL
          items={[
            "the CAN-SPAM Act and FTC rules on commercial email, advertising, endorsements, and unfair or deceptive practices;",
            "Canada's Anti-Spam Legislation (CASL), the UK Privacy and Electronic Communications Regulations (PECR), the EU ePrivacy Directive, and similar laws;",
            "the GDPR, UK GDPR, the California Consumer Privacy Act as amended (CCPA), and other privacy and data protection laws;",
            "the Telephone Consumer Protection Act (TCPA), telemarketing and do-not-call rules, and state call and text laws, for any calls or texts you or your team make or receive;",
            "call recording and wiretapping laws, including laws that require the consent of every party to a call;",
            "licensing, registration, disclosure, and advertising rules that apply to your industry, such as financial services, securities, lending, insurance, real estate, healthcare, legal services, and employment; and",
            "export control, sanctions, and anti-bribery laws.",
          ]}
        />
        <P>
          You must honor opt-out and unsubscribe requests promptly, and you must tell us immediately about any opt-out, complaint,
          legal demand, or regulatory inquiry you receive about a Campaign. We will add opt-outs we receive to a suppression list and
          stop contacting those Prospects. You will not ask us to contact anyone who has opted out.
        </P>
        <P>
          We may, but are not required to, review Customer Content or Campaigns for compliance. Any review, suggestion, or approval by
          us is for operational purposes only, is not legal advice, and does not transfer responsibility for compliance to us.
        </P>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use and prohibited offers",
    body: (
      <>
        <P>You will not use the Services, and will not ask us to run Campaigns, for or in connection with:</P>
        <UL
          items={[
            "anything illegal, fraudulent, deceptive, or misleading, including false or unsubstantiated claims, fake urgency, impersonation, or misleading subject lines or sender information;",
            "consumer marketing, or contacting people at personal email addresses for non-business purposes;",
            "adult content, gambling, weapons, drugs or drug paraphernalia, tobacco or vaping products, debt relief or credit repair, payday or predatory lending, get-rich-quick schemes, multi-level marketing, pyramid schemes, unregistered securities, or cryptocurrency or token offerings;",
            "anything that infringes intellectual property, privacy, or publicity rights, or that is defamatory, harassing, hateful, threatening, or discriminatory;",
            "collecting sensitive information from Prospects, such as health, financial account, government ID, or biometric information;",
            "decisions about anyone's eligibility for credit, insurance, housing, or employment, or any purpose regulated by the Fair Credit Reporting Act or similar laws;",
            "malware, phishing, credential harvesting, or links to unsafe or deceptive websites; or",
            "any attempt to interfere with, reverse engineer, scrape, overload, or gain unauthorized access to the Services, our Sending Infrastructure, or any Third-Party Service.",
          ]}
        />
        <P>
          We decide in our sole discretion whether an offer, message, or activity violates this section. We may refuse, edit, pause,
          or stop any Campaign, and suspend or terminate your account, if we believe a violation has occurred or is likely.
        </P>
      </>
    ),
  },
  {
    id: "copy",
    title: "Copy and approvals",
    body: (
      <>
        <P>
          We write Campaign copy based on Customer Content and our own experience. If you choose to approve copy before launch, copy
          is approved when you approve it in writing, including by email, message, or in the dashboard, or when you do not object within
          two business days after we send it to you. If you choose to let your operator launch without your approval, you authorize us
          to write, test, change, and send copy on your behalf, and that copy is treated as approved by you.
        </P>
        <P>
          You are responsible for the accuracy of every statement about your business, offer, pricing, results, clients, and
          credentials that appears in approved copy, including statements we drafted from information you provided.
        </P>
      </>
    ),
  },
  {
    id: "prospect-data",
    title: "Prospect data",
    body: (
      <>
        <P>
          We build Prospect lists using Third-Party Services, publicly available sources, and our own methods. Prospect Data is
          provided &ldquo;as is.&rdquo; We do not guarantee that it is complete, accurate, current, or that any person or email address
          is valid, reachable, or a decision-maker, and we are not liable for bounces, wrong contacts, or outdated information.
        </P>
        <P>
          You may use Prospect Data and Prospect replies we share with you only to follow up with those Prospects for legitimate
          business-to-business purposes, in compliance with Applicable Law. You will not sell, license, publish, or give Prospect Data to
          anyone else, load it into other outreach tools to contact Prospects who have not replied, combine it to build a competing
          database, or use it for any purpose listed in the Acceptable use section. Except for Prospect replies and contact details of
          Prospects who express interest, Prospect Data remains our or our providers&apos; property and is not a deliverable of the
          Services.
        </P>
        <P>
          You are responsible for any Prospect Data you keep after a Prospect is routed to you, including responding to any privacy
          requests from those Prospects that are directed to you.
        </P>
      </>
    ),
  },
  {
    id: "infrastructure",
    title: "Domains, inboxes and phone numbers",
    body: (
      <>
        <P>
          The cost of the sending domains and inboxes we register for Campaigns is included in your subscription while it is active.
          We register, own, and control all Sending Infrastructure, even if a domain name resembles your brand. You receive a limited,
          revocable right to have Campaigns sent from that infrastructure during your paid subscription. You authorize us to register
          domain names that resemble your company or brand name for this purpose, and you represent that doing so does not violate
          anyone&apos;s rights.
        </P>
        <P>
          Sending Infrastructure is not transferred to you when your subscription ends. We may, at our discretion, offer to transfer
          specific domains to you for a fee. You will not log into, change, or use our Sending Infrastructure without our written
          permission.
        </P>
        <P>
          Deliverability depends on factors outside our control, including mailbox provider filtering, blocklists, recipient behavior,
          and Third-Party Service policies. We are not liable if any domain, inbox, phone number, or account is filtered, blocklisted,
          rate-limited, suspended, or terminated, and our only obligation in that case is to use reasonable efforts to replace it while
          your subscription is active.
        </P>
      </>
    ),
  },
  {
    id: "calls",
    title: "Call tracking, routing and recording",
    body: (
      <>
        <P>
          If you choose to have interested Prospects call you, we may give Prospects a tracked phone number that forwards to the number
          you provide. Tracked numbers are provided through a Third-Party Service, are controlled by us, and are reclaimed when your
          subscription ends. Tracked numbers are not for emergency calls.
        </P>
        <P>
          Calls to tracked numbers may be logged and recorded, including the caller&apos;s number, approximate location, time, duration,
          and audio, so that calls can be counted and shown in your dashboard. You are responsible for answering calls, for every
          conversation you have with Prospects, and for any calls or texts you make to them. Where Applicable Law requires notice or
          consent for call recording, you are responsible for providing that notice and obtaining that consent, and you authorize us to
          play a recording disclosure on tracked calls. If you do not want calls recorded, tell us in writing and we will turn
          recording off where our providers allow it.
        </P>
        <P>
          Call counts, durations, and recordings come from Third-Party Services and may be delayed, incomplete, or inaccurate. They are
          provided for information and are not a basis for fees, refunds, or credits.
        </P>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    body: (
      <>
        <P>
          The Services rely on Third-Party Services, including for data, email delivery, mailboxes, sending, call tracking, scheduling,
          payments, authentication, and hosting. Your use of some features may also be subject to those providers&apos; terms, which you
          agree to follow. We do not control Third-Party Services and are not responsible for their availability, accuracy, security,
          policy changes, price changes, or acts or omissions. If a Third-Party Service becomes unavailable or changes its terms, we may
          substitute another provider or change the affected feature.
        </P>
        <P>
          Payments are processed by Stripe. Bookings made through our website are processed by our scheduling provider. We do not
          receive or store your full card number.
        </P>
      </>
    ),
  },
  {
    id: "fees",
    title: "Fees, billing and renewal",
    body: (
      <>
        <P>
          Subscriptions are billed monthly in advance, starting on the day you subscribe, at the price shown for your selected plan when
          you check out. Your subscription renews automatically each month until it is cancelled. By subscribing, you authorize us and
          our payment processor to charge your payment method for each renewal, and for any taxes and amounts owed, without further
          approval from you.
        </P>
        <UL
          items={[
            "Prices do not include taxes. You are responsible for all sales, use, value-added, withholding, and similar taxes, other than taxes on our net income.",
            "If you change your plan, the new price applies from the change date or the next billing date, as shown at the time of the change. Any proration is calculated by our payment processor.",
            "We may change our prices with at least 30 days' notice by email or in the dashboard. New prices apply from your next billing date after the notice period. If you do not agree, you may cancel before the new price takes effect.",
            "If a payment fails, we may retry it, suspend the Services, pause Campaigns, or terminate your subscription. Overdue amounts accrue interest at 1.5% per month or the highest rate allowed by law, whichever is lower, and you will reimburse our reasonable costs of collection, including attorneys' fees.",
            "There are no setup fees unless an Order states otherwise.",
          ]}
        />
      </>
    ),
  },
  {
    id: "cancellation",
    title: "Cancellation, refunds and chargebacks",
    body: (
      <>
        <P>
          You may cancel at any time by emailing <A href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</A> from your account
          email address, or through any cancellation option we make available in your dashboard.
          Cancellation takes effect at the end of your current paid billing period, and you keep access to the Services until then. We
          may wind down Campaigns during the final days of the period so that sequences end cleanly.
        </P>
        <Caps>
          All fees are non-refundable. We do not provide refunds or credits for partial months, unused sending volume, paused Campaigns,
          periods of non-use, dissatisfaction with results, or early cancellation, except where Applicable Law requires it.
        </Caps>
        <P>
          Because work begins immediately after you subscribe, including list building, domain registration, and inbox setup, you agree
          that the Services begin as soon as payment is made. If you believe a charge is wrong, you agree to contact us at{" "}
          <A href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</A> within 30 days of the charge and give us a reasonable
          opportunity to resolve it before disputing it with your bank or card issuer. Filing a chargeback or payment dispute for a charge
          that complies with these Terms is a breach of these Terms. We may suspend the Services immediately, provide evidence of your
          acceptance of these Terms and of the work performed to your card issuer, and recover the disputed amount together with any
          dispute fees and collection costs.
        </P>
      </>
    ),
  },
  {
    id: "no-guarantee",
    title: "No guarantee of results",
    body: (
      <>
        <Caps>
          We do not guarantee any particular number of emails delivered, inbox placement, opens, replies, positive replies, calls,
          meetings, deals, revenue, return on investment, or other business result.
        </Caps>
        <P>
          Outbound results depend on many factors outside our control, including your offer, pricing, reputation, market, timing,
          competition, sales process, how quickly and well you follow up, and the decisions of Prospects and mailbox providers. Any
          figures on our website, in the ROI calculator, in sales conversations, or in case studies, including reply rates, conversion
          rates, deal sizes, and projected revenue, are illustrations based on assumptions. They are not promises or predictions of your
          results. You are responsible for your own business decisions.
        </P>
      </>
    ),
  },
  {
    id: "dashboard",
    title: "Your account and dashboard",
    body: (
      <>
        <P>
          You are responsible for keeping your login credentials confidential, for all activity under your account, and for making sure
          that only people you authorize use it. Notify us immediately of any unauthorized use. We are not liable for losses caused by
          someone using your credentials.
        </P>
        <P>
          Dashboard figures, activity, and messages are compiled from our systems and Third-Party Services. They may be delayed,
          estimated, or corrected later, and are provided for information only. Messages you send to your operator through the dashboard
          are handled during business hours and are not monitored continuously. Changes you request through the dashboard take effect
          once your operator applies them.
        </P>
      </>
    ),
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: (
      <>
        <P>
          {C} and its licensors own all rights in the Services, the website, the dashboard, our software, processes, playbooks,
          templates, frameworks, prompts, know-how, and all improvements to them, including anything we learn or develop while working
          with you. Nothing in these Terms transfers ownership of any of these to you.
        </P>
        <P>
          You keep ownership of Customer Content. You grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, and
          display Customer Content to provide, support, and improve the Services, and for the publicity rights described below.
        </P>
        <P>
          Subject to payment of all fees, you may use the Campaign copy we write for you for your own internal business purposes, both
          during and after your subscription. We may reuse the general structure, techniques, and non-confidential elements of any copy,
          and nothing prevents us from creating similar copy for others.
        </P>
        <P>
          We may collect and use data about how the Services perform, such as deliverability, reply rates, and the performance of
          messaging approaches, and may use it in aggregated or de-identified form that does not identify you, to operate and improve
          the Services. If you give us suggestions or feedback, we may use them without restriction or compensation.
        </P>
      </>
    ),
  },
  {
    id: "confidentiality",
    title: "Confidentiality",
    body: (
      <P>
        Each party may receive non-public information from the other that is marked confidential or that a reasonable person would
        understand to be confidential, including your business plans and our pricing, methods, vendors, and processes. The receiving
        party will use it only to perform under these Terms, will protect it with reasonable care, and will not disclose it except to
        employees, contractors, and advisers who need to know it and are bound by similar obligations, or where required by law after
        giving notice where lawful. These obligations do not apply to information that is or becomes public through no fault of the
        receiving party, was already known to it, is independently developed, or is received from someone free to share it. These
        obligations last for three years after your subscription ends, and indefinitely for trade secrets.
      </P>
    ),
  },
  {
    id: "publicity",
    title: "Publicity",
    body: (
      <P>
        We may identify you as a customer by name and logo on our website and in sales materials. We will not publish your results,
        quotes, or case studies without your permission. You can ask us to stop using your name and logo at any time by emailing{" "}
        <A href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</A>, and we will remove them from materials we control within a
        reasonable time.
      </P>
    ),
  },
  {
    id: "non-solicitation",
    title: "Non-solicitation",
    body: (
      <P>
        During your subscription and for twelve months after it ends, you will not directly or indirectly solicit for employment or
        engagement, or hire or engage, any employee or contractor of {C} who worked on your account, without our written consent.
        General job postings not targeted at our people are not a violation. If you breach this section, you will pay us, as liquidated
        damages and not as a penalty, an amount equal to the individual&apos;s compensation from {C} for the twelve months before the
        breach, which the parties agree is a reasonable estimate of our loss.
      </P>
    ),
  },
  {
    id: "warranties",
    title: "Disclaimer of warranties",
    body: (
      <Caps>
        The Services, the website, the dashboard, Prospect Data, and all content and deliverables are provided &ldquo;as is&rdquo; and
        &ldquo;as available.&rdquo; To the fullest extent permitted by law, {C} disclaims all warranties, whether express, implied,
        statutory, or otherwise, including warranties of merchantability, fitness for a particular purpose, title, non-infringement,
        accuracy, and any warranties arising from course of dealing or usage of trade. We do not warrant that the Services will be
        uninterrupted, error-free, secure, or free of harmful components, that messages will be delivered or reach the inbox, or that any
        result will be achieved.
      </Caps>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <Caps>
          To the fullest extent permitted by law, in no event will {C} or its owners, officers, employees, contractors, agents, licensors,
          or suppliers be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of
          profits, revenue, business, opportunity, goodwill, data, or reputation, or the cost of substitute services, arising out of or
          relating to these Terms or the Services, however caused and under any theory of liability, even if advised of the possibility
          of such damages.
        </Caps>
        <Caps>
          To the fullest extent permitted by law, {C}&apos;s total cumulative liability arising out of or relating to these Terms or the
          Services will not exceed the fees you actually paid to {C} for the Services during the three months immediately before the event
          giving rise to the liability.
        </Caps>
        <P>
          These limits apply even if a remedy fails of its essential purpose. They are an essential part of the bargain between the parties
          and are reflected in our prices. They do not limit your obligation to pay fees or your indemnification obligations.
        </P>
      </>
    ),
  },
  {
    id: "indemnification",
    title: "Indemnification",
    body: (
      <>
        <P>
          You will defend, indemnify, and hold harmless {C} and its owners, officers, employees, contractors, agents, licensors, and
          suppliers from and against all claims, demands, investigations, actions, losses, damages, fines, penalties, settlements,
          judgments, costs, and expenses, including reasonable attorneys&apos; fees, arising out of or relating to:
        </P>
        <UL
          items={[
            "Customer Content, your offer, products, services, claims, and websites;",
            "Campaigns sent on your behalf, including any claim that a Campaign violated CAN-SPAM, CASL, PECR, the TCPA, privacy or data protection law, call recording law, or any other Applicable Law, except to the extent caused by our sending a message you had specifically and timely told us in writing not to send;",
            "your communications, calls, texts, meetings, and dealings with Prospects, and your use of Prospect Data;",
            "your breach of these Terms or violation of Applicable Law or anyone's rights; and",
            "any dispute between you and a Prospect, your customer, or any other third party.",
          ]}
        />
        <P>
          We may choose our own counsel to participate in the defense at your cost, and you will not settle any claim that imposes an
          obligation or admission on us without our written consent.
        </P>
      </>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: (
      <>
        <P>
          We may suspend or pause any or all of the Services, or terminate your subscription and account, immediately and with or without
          notice, if you fail to pay, breach these Terms, file a payment dispute, provide false information, create legal, regulatory,
          reputational, or deliverability risk, receive excessive complaints or opt-outs, or if a Third-Party Service or authority requires
          it. We may also terminate for convenience on 30 days&apos; notice, in which case we will refund any prepaid fees for the period
          after termination.
        </P>
        <P>
          When your subscription ends for any reason, your right to use the Services and Sending Infrastructure ends, we stop Campaigns,
          tracked numbers are reclaimed, and all unpaid fees become due immediately. We may delete your data after a reasonable period as
          described in our Privacy Policy. Sections that by their nature should survive, including fees owed, cancellation and refunds,
          no guarantee of results, intellectual property, confidentiality, non-solicitation, disclaimers, limitation of liability,
          indemnification, dispute resolution, and general terms, survive termination.
        </P>
      </>
    ),
  },
  {
    id: "disputes",
    title: "Dispute resolution and arbitration",
    body: (
      <>
        <Caps>
          Please read this section carefully. It requires disputes to be resolved by binding individual arbitration and waives the right
          to a jury trial and to participate in a class action.
        </Caps>
        <H3>Informal resolution first</H3>
        <P>
          Before starting any formal proceeding, the party with a dispute must send a written notice describing it to the other party (to
          us at <A href={`mailto:${legal.legalEmail}`}>{legal.legalEmail}</A>), and both parties will try in good faith to resolve it for
          30 days.
        </P>
        <H3>Binding arbitration</H3>
        <P>
          Any dispute, claim, or controversy arising out of or relating to these Terms, the Services, or the relationship between the
          parties, including disputes about the scope or enforceability of this arbitration agreement, will be resolved by final and
          binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules, before a single
          arbitrator. The arbitration will take place in {legal.venue}, or by video conference if both parties agree, and will be conducted
          in English. The arbitrator may award any relief available in court, subject to the limitations in these Terms. Judgment on the
          award may be entered in any court with jurisdiction. The Federal Arbitration Act governs this section.
        </P>
        <H3>Exceptions</H3>
        <P>
          Either party may bring an individual claim in small claims court if it qualifies, and either party may seek temporary or
          preliminary injunctive relief in court to protect its intellectual property, confidential information, or Sending
          Infrastructure, or to stop a violation of the Acceptable use section. We may also bring an action in court to collect unpaid
          fees.
        </P>
        <H3>Class action and jury waiver</H3>
        <Caps>
          All disputes must be brought in a party&apos;s individual capacity, and not as a plaintiff or class member in any purported class,
          collective, consolidated, or representative proceeding. The arbitrator may not consolidate claims of more than one party. To the
          extent any dispute proceeds in court, each party waives its right to a jury trial.
        </Caps>
        <H3>Time limit</H3>
        <P>
          Any claim against {C} must be brought within one year after the cause of action arises, or it is permanently barred, to the
          extent permitted by law.
        </P>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law and venue",
    body: (
      <P>
        These Terms are governed by the laws of the State of {legal.governingState}, without regard to its conflict of laws rules. The
        United Nations Convention on Contracts for the International Sale of Goods does not apply. Subject to the arbitration section,
        the state and federal courts located in {legal.venue} have exclusive jurisdiction over any action permitted to be brought in court,
        and each party consents to personal jurisdiction and venue there.
      </P>
    ),
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    body: (
      <P>
        We may update these Terms from time to time. We will post the updated Terms on this page with a new effective date and, for
        material changes, notify you by email or in the dashboard. Changes take effect on the date posted, except that material changes
        affecting paid subscriptions take effect at your next billing date after notice. Your continued use of the Services after changes
        take effect means you accept them. If you do not agree, you must cancel before they take effect.
      </P>
    ),
  },
  {
    id: "electronic",
    title: "Electronic communications and records",
    body: (
      <P>
        You agree to receive notices, agreements, invoices, and other communications from us electronically, by email to your account
        address or in the dashboard, and that these satisfy any legal requirement for written communications. Your acceptance of these
        Terms by checkbox or by using the Services is an electronic signature with the same effect as a handwritten signature. We keep
        records of acceptance, including the date, time, and version accepted, and you agree these records are admissible as evidence.
      </P>
    ),
  },
  {
    id: "force-majeure",
    title: "Events beyond our control",
    body: (
      <P>
        We are not liable for any delay or failure to perform caused by events beyond our reasonable control, including outages or policy
        changes of Third-Party Services or mailbox providers, internet or telecommunications failures, cyberattacks, natural disasters,
        epidemics, war, terrorism, civil unrest, labor disputes, government action, or changes in law.
      </P>
    ),
  },
  {
    id: "general",
    title: "General terms",
    body: (
      <UL
        items={[
          "The parties are independent contractors. Nothing in these Terms creates a partnership, joint venture, agency, fiduciary, or employment relationship, and neither party may bind the other, except that you authorize us to send Campaigns on your behalf as described here.",
          "You may not assign or transfer these Terms without our written consent. We may assign them, including in connection with a merger, acquisition, or sale of assets, or to an affiliate.",
          `Notices to us must be sent to ${legal.legalEmail}. Notices to you may be sent to your account email or posted in the dashboard.`,
          "These Terms, together with the Privacy Policy and any Order, are the entire agreement between the parties about their subject matter and replace all prior discussions, proposals, and representations. You have not relied on any statement that is not in these Terms.",
          "If any provision is found unenforceable, it will be enforced to the maximum extent possible and the rest of these Terms remain in effect.",
          "Our failure to enforce any provision is not a waiver of our right to do so later.",
          "There are no third-party beneficiaries of these Terms, except that the persons protected by the limitation of liability and indemnification sections may enforce them.",
          "Headings are for convenience only. The words \"including\" and \"for example\" mean without limitation.",
          "You will comply with all export control and sanctions laws, and you represent that you are not located in, organized under the laws of, or owned or controlled by anyone in a sanctioned country or on a government restricted-party list.",
        ]}
      />
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <P>
        Questions about these Terms can be sent to <A href={`mailto:${legal.legalEmail}`}>{legal.legalEmail}</A>. For help with your
        account or billing, email <A href={`mailto:${legal.supportEmail}`}>{legal.supportEmail}</A>.
      </P>
    ),
  },
];

export function Terms() {
  return (
    <LegalLayout
      title="Terms of Service"
      intro={
        <p>
          These Terms explain the rules for using {C}&apos;s website, dashboard, and done-for-you outbound services. They include a
          binding arbitration agreement and class action waiver in the Dispute resolution section, and they limit our liability. Please
          read them carefully.
        </p>
      }
      sections={sections}
    />
  );
}
