import { PublicFilmSequence, type PublicCinemaChapter } from "@/features/public-cinema";
import { PublicFooter } from "@/components/PublicFooter";
import { PublicStory } from "./PublicStory";
import { PUBLIC_STORIES, type PublicRoute } from "./public-content";
import styles from "./public-editorial.module.css";

export function PublicExperience({ route, chapters }: { route: PublicRoute; chapters: readonly PublicCinemaChapter[] }) {
  const hero = chapters.filter(chapter => chapter.delivery === "ready").slice(0, 1).map(chapter => ({ ...chapter, href: "#public-story", action: "Explore the story", facts: route === "network" ? ["21 independent member companies", "A member-owned organization"] : chapter.facts.filter(fact => !/unsupported|qualitative|claim|reconcil|implied/i.test(fact)) }));
  return <main id="main-content" className={styles.page} tabIndex={-1} data-public-redesign="editorial-2026-11"><PublicFilmSequence routeLabel={route === "home" ? "Distranet / Independent strength. Connected." : `Distranet / ${PUBLIC_STORIES[route].label}`} chapters={hero} /><PublicStory route={route} /><PublicFooter /></main>;
}
