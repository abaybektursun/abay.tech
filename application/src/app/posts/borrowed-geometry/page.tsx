"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

import { COPY } from "./copy";
import { FONT_VARS } from "./fonts";

import ExaptationScatter from "./components/ExaptationScatter";
import CATrainingEdgeBand from "./components/CATrainingEdgeBand";
import CubeIsolationCurves from "./components/CubeIsolationCurves";
import Comments from "@/components/comments";

import heads from "./data/heads.json";
import cubeCurves from "./data/cube_curves.json";

import "./tokens.css";

const Walker2dViewer = dynamic(() => import("./components/Walker2dViewer"), {
  ssr: false,
  loading: () => (
    <div
      className="border border-[--rule] bg-[#0E1118] flex items-center justify-center"
      style={{ aspectRatio: "16/9" }}
    >
      <span className="t-eyebrow" style={{ color: "#8E96A4" }}>loading viewer</span>
    </div>
  ),
});

export default function BorrowedGeometryPage() {
  const c = COPY;

  return (
    <div className={`specimen ${FONT_VARS}`}>
      <article className="max-w-[680px] mx-auto px-5 pt-6 pb-20">

        {/* Hero */}
        <header className="mb-12">
          <div className="t-eyebrow accent mb-4">{c.hero.eyebrow}</div>
          <h1 className="t-display max-w-[18ch]">{c.hero.title}</h1>
          <p className="t-deck mt-5 max-w-[54ch]">{c.hero.deck}</p>
        </header>

        {/* What came out — stat-led wins block */}
        <section className="mb-16">
          <div className="t-eyebrow mb-2">
            <span className="accent">{c.results.eyebrow}</span>
          </div>
          <ul>
            {c.results.items.map((it, i) => (
              <li
                key={i}
                className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-x-6 gap-y-2 items-baseline py-6 border-t border-[--rule] last:border-b"
              >
                <div className="t-numeral accent whitespace-nowrap">
                  {it.stat}
                </div>
                <div className="min-w-0">
                  <h3 className="t-h2">{it.headline}</h3>
                  <p className="t-body mt-2">{it.body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 t-deck">{c.results.closing}</p>
        </section>

        {/* § 01 — origin (NTM → 492× on CA R90) */}
        <Section number="§ 01" eyebrow="origin" title={c.surprise.title}>
          <div className="mt-5 space-y-4">
            {c.surprise.body.slice(0, 5).map((p, i) => (<p key={i} className="t-body">{p}</p>))}
          </div>
          <Figure number="figure 1." caption={c.figures.caRule90}>
            <CATrainingEdgeBand />
          </Figure>
          <p className="t-body">{c.surprise.body[5]}</p>
        </Section>

        {/* § 02 — premise */}
        <Section number="§ 02" eyebrow="premise" title={c.premise.title}>
          <Body items={c.premise.body} />
        </Section>

        {/* § 03 — exaptation finding */}
        <Section number="§ 03" eyebrow="exaptation" title={c.exaptation.title}>
          <Body items={c.exaptation.body} />
          <div className="mt-8 space-y-7">
            <div>
              <div className="t-eyebrow accent mb-2">{c.exaptation.q1Label}</div>
              <p className="t-body">{c.exaptation.q1Body}</p>
            </div>
            <div>
              <div className="t-eyebrow accent mb-2">{c.exaptation.q2Label}</div>
              <p className="t-body">{c.exaptation.q2Body}</p>
            </div>
          </div>
          <p className="t-h2 mt-10 max-w-[20ch]">{c.exaptation.punch}</p>
          <Figure number="figure 2." caption={c.figures.exaptation}>
            <ExaptationScatter data={heads} />
          </Figure>
          <p className="t-body">{c.exaptation.closing}</p>
          <p className="t-deck mt-8 pl-5 border-l-2 border-[--accent]">{c.exaptation.name}</p>
        </Section>

        {/* § 04 — distributed + crystallized */}
        <Section number="§ 04" eyebrow="how it's organized" title={c.pretraining.title}>
          <Body items={c.pretraining.body} />
        </Section>

        {/* § 05 — three transfers (cube isolation chart + walker2d viewer) */}
        <Section number="§ 05" eyebrow="three transfers" title={c.wins.title}>
          <Body items={c.wins.body} />
          <p className="t-body mt-6">{c.wins.scenePlay}</p>
          <p className="t-body mt-6">{c.wins.cubeDouble}</p>
          <Figure number="figure 3." caption={c.figures.cubeIsolation}>
            <CubeIsolationCurves data={cubeCurves} />
          </Figure>
          <p className="t-body mt-6">{c.wins.walker2d}</p>

          <figure className="my-10 -mx-2 md:-mx-8">
            <Walker2dViewer />
            <figcaption className="t-caption mt-3 px-2 md:px-8 flex gap-3">
              <span className="t-data uppercase tracking-wider shrink-0" style={{ color: "var(--ink-3)" }}>
                figure 4.
              </span>
              <span>{c.figures.walker2d}</span>
            </figcaption>
          </figure>

          <p className="t-deck pl-5 border-l-2 border-[--accent]">{c.wins.closing}</p>
        </Section>

        {/* § 06 — what's actually inside */}
        <Section number="§ 06" eyebrow="implications" title={c.whatsInside.title}>
          <Body items={c.whatsInside.body} />
          <p className="t-h2 mt-10">{c.whatsInside.closer1}</p>
          <p className="t-deck mt-3" style={{ color: "var(--ink-3)" }}>{c.whatsInside.closer2}</p>
        </Section>

        {/* § 07 — what's left (first anchor) */}
        <Section number="§ 07" eyebrow="first anchor" title={c.firstStep.title}>
          <Body items={c.firstStep.body} />
          <p className="t-body mt-7" style={{ color: "var(--ink-2)" }}>
            {c.firstStep.caveat}{" "}
            <a
              href={c.firstStep.paperHref}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-[--accent] underline-offset-4 hover:text-[--ink] whitespace-nowrap"
              style={{ color: "var(--ink)" }}
            >
              {c.firstStep.paperLabel} →
            </a>
          </p>
        </Section>

        {/* Comments — GitHub Discussions via giscus */}
        <div className="h-px bg-[--rule] mt-20" />
        <Comments />
      </article>
    </div>
  );
}

function Section({ number, eyebrow, title, children }: {
  number?: string; eyebrow?: string; title?: string; children: ReactNode;
}) {
  return (
    <section className="mt-16">
      <div className="t-eyebrow mb-3">
        {number && <span className="accent">{number}</span>}
        {number && eyebrow && <span className="mx-2 opacity-40">·</span>}
        {eyebrow}
      </div>
      {title && <h2 className="t-h2">{title}</h2>}
      {children}
    </section>
  );
}

function Body({ items }: { items: readonly string[] }) {
  return (
    <div className="mt-5 space-y-4">
      {items.map((p, i) => (<p key={i} className="t-body">{p}</p>))}
    </div>
  );
}

function Figure({ number, caption, children }: { number: string; caption: string; children: ReactNode }) {
  return (
    <figure className="my-8">
      {children}
      <figcaption className="t-caption mt-3 flex gap-3">
        <span className="t-data uppercase tracking-wider shrink-0" style={{ color: "var(--ink-3)" }}>{number}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
