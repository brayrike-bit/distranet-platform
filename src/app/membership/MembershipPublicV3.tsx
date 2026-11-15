import Link from "next/link";
import { PublicFooter } from "@/components/PublicFooter";
import {
  PublicContinuum,
  PublicFilmSequence,
  type PublicCinemaChapter,
} from "@/features/public-cinema";
import styles from "./membership-public-v3.module.css";

const membershipMedia = (film: string, portrait = false) => {
  const aspect = portrait ? "9x16" : "16x9";
  const root = `/media/cinematic/membership/v3/${film}${portrait ? "/portrait-v1" : ""}`;
  return {
    poster: {
      src: `${root}/poster-resolve-${aspect}-v1.webp`,
      width: portrait ? 1080 : 1920,
      height: portrait ? 1920 : 1080,
      focalPoint: portrait ? "50% 66%" : "67% 52%",
    },
    sources: [
      {
        src: `${root}/master-${aspect}-v1.webm`,
        type: "video/webm" as const,
      },
      {
        src: `${root}/master-${aspect}-v1.mp4`,
        type: "video/mp4" as const,
      },
    ],
  } as const;
};

export const membershipPublicV3Chapters: readonly PublicCinemaChapter[] = [
  {
    id: "membership-fit-gates",
    index: "01 / 02",
    label: "Fit gates",
    eyebrow: "A mutual operating decision",
    title: "Fit is deliberate.",
    accent: "Not automatic.",
    summary:
      "Membership is a mutual-fit conversation for independent fluid power operators who value collaboration, operational capability, data readiness, and leadership commitment.",
    href: "#membership-fit",
    action: "Review the fit framework",
    facts: ["Working fit language", "Final criteria require board approval"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 300,
    desktop: membershipMedia("01-fit-gate-photoreal"),
    mobile: membershipMedia("01-fit-gate-photoreal", true),
    beats: [
      {
        id: "independent-structure",
        label: "Independent",
        progress: 0,
        description: "An unbranded candidate module enters as an intact independent operator.",
      },
      {
        id: "collaboration",
        label: "Collaborative",
        progress: 0.3,
        description: "A physical coupling test represents willingness to participate in shared systems.",
      },
      {
        id: "capability",
        label: "Operational fit",
        progress: 0.64,
        description: "Operating-load and clean-data-connector tests remain mechanical metaphors, not acceptance scores.",
      },
      {
        id: "leadership",
        label: "Leadership alignment",
        progress: 1,
        description: "The candidate resolves beside, but not yet connected to, the member-owned spine.",
      },
    ],
    delivery: "ready",
  },
  {
    id: "membership-member-docking",
    index: "02 / 02",
    label: "Member docking",
    eyebrow: "Independent identity / connected capability",
    title: "Keep your identity.",
    accent: "Multiply your strength.",
    summary:
      "The membership model is intended to add shared capability without erasing the independent company that joins it. Admission and activation remain governed decisions.",
    href: "#membership-inquiry",
    action: "Begin a membership inquiry",
    facts: ["Candidate identity remains separate", "Activation is controlled"],
    durationSeconds: 10.041667,
    fps: 24,
    runwayVh: 360,
    desktop: membershipMedia("02-member-docking"),
    mobile: membershipMedia("02-member-docking", true),
    beats: [
      {
        id: "alignment",
        label: "Alignment",
        progress: 0,
        description: "The approved candidate module aligns with a credible quick-connect bus.",
      },
      {
        id: "contact",
        label: "Mechanical contact",
        progress: 0.34,
        description: "Seals and collars make physically plausible contact without changing the candidate identity face.",
      },
      {
        id: "signal",
        label: "Capability connects",
        progress: 0.7,
        description: "Controlled shared pressure enters the connected module.",
      },
      {
        id: "identity",
        label: "Identity remains",
        progress: 1,
        description: "The independent identity face and exact Distranet certification plaque remain visibly distinct.",
      },
    ],
    delivery: "ready",
  },
] as const;

const fitFramework = [
  ["Independent operator", "An independently operated fluid power company aligned with the member-owned model."],
  ["Collaborative mindset", "Leadership prepared to participate in shared programs and governed decisions."],
  ["Operating capability", "A company able to execute reliably inside a multi-member operating network."],
  ["Data readiness", "A willingness to connect approved inventory and reporting workflows responsibly."],
  ["Leadership commitment", "Executive sponsorship for a durable relationship, not a short-term promotion."],
] as const;

const membershipPath = [
  ["Discovery", "A confidential conversation about the company and the network."],
  ["Alignment", "Mutual review of operating goals, values, and expectations."],
  ["Validation", "Due diligence against the final board-approved membership framework."],
  ["Activation", "A controlled onboarding decision after the appropriate approval."],
] as const;

const faqs = [
  {
    question: "Does membership replace local ownership?",
    answer:
      "No. The core positioning is collective scale without surrendering the member company's independent identity or operating control.",
  },
  {
    question: "Are territory protections guaranteed?",
    answer:
      "No public guarantee is being made. Exact territory language remains under leadership review and must be approved before publication.",
  },
  {
    question: "What information is expected from a member?",
    answer:
      "Approved inventory, location, fulfillment, and reporting workflows are part of the operating model. Final data requirements and privacy terms still require governance approval.",
  },
  {
    question: "What happens after an inquiry?",
    answer:
      "The intended path is a human discovery conversation, mutual alignment, due diligence, a board-governed decision, and controlled activation. No public approval timeline is promised.",
  },
] as const;

export function MembershipPublicV3() {
  return (
    <main id="main-content" className={styles.page} tabIndex={-1}>
      <PublicFilmSequence
        routeLabel="Distranet / Membership"
        chapters={membershipPublicV3Chapters.filter((chapter) => chapter.delivery === "ready").slice(0, 1)}
      />

      <PublicContinuum tone="membership" label="Independent strength / governed entry">

      <section className={styles.invitation} aria-labelledby="membership-v3-invitation">
        <p>NOT A FRANCHISE / NOT A ROLL-UP / NOT A DIRECTORY</p>
        <h2 id="membership-v3-invitation">
          Join shared capability.
          <em>Keep the company you built.</em>
        </h2>
        <div>
          <p>
            Distranet membership is presented as an operating relationship among
            independent companies. The purpose is to connect leverage, inventory,
            commerce, and evidence—not to standardize away local identity.
          </p>
          <small>Recommended positioning copy · final brand approval remains with Distranet leadership.</small>
        </div>
      </section>

      <section
        id="membership-fit"
        className={styles.fit}
        aria-labelledby="membership-v3-fit"
      >
        <header>
          <p>WORKING FIT FRAMEWORK / NOT FINAL ACCEPTANCE CRITERIA</p>
          <h2 id="membership-v3-fit">Five questions before an application ever begins.</h2>
        </header>
        <ol>
          {fitFramework.map(([title, copy], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.path} aria-labelledby="membership-v3-path">
        <header>
          <p>A GOVERNED MEMBERSHIP PATH</p>
          <h2 id="membership-v3-path">Conversation before commitment.</h2>
        </header>
        <ol>
          {membershipPath.map(([title, copy], index) => (
            <li key={title}>
              <span>0{index + 1}</span>
              <div><h3>{title}</h3><p>{copy}</p></div>
            </li>
          ))}
        </ol>
      </section>

      <section
        id="membership-inquiry"
        className={styles.inquiry}
        aria-labelledby="membership-v3-inquiry"
      >
        <p>INQUIRY WORKFLOW / NOT CONNECTED</p>
        <h2 id="membership-v3-inquiry">A secure conversation needs a real owner and a real privacy contract.</h2>
        <p>
          No information is collected or submitted by this component. Production
          inquiry requires an approved recipient or system of record, privacy
          notice, retention rule, consent language, spam protection, response
          owner, success receipt, and failure behavior.
        </p>
        <Link href="/about">Understand ownership and governance <span aria-hidden="true">↗</span></Link>
      </section>

      <section className={styles.faq} aria-labelledby="membership-v3-faq">
        <header>
          <p>MEMBERSHIP QUESTIONS</p>
          <h2 id="membership-v3-faq">Plain answers. Clear boundaries.</h2>
        </header>
        <div>
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
      </PublicContinuum>

      <PublicFooter />
    </main>
  );
}
