import type { CSSProperties } from "react";
import type { CinematicFilmAsset, CinematicPoster } from "./mediaManifest";
import styles from "./cinematicMedia.module.css";

type PosterStyle = CSSProperties & {
  "--cinematic-focal-point"?: string;
  "--cinematic-mobile-focal-point"?: string;
};

export type AccessibleFilmPosterProps = Readonly<{
  asset: Pick<
    CinematicFilmAsset,
    "title" | "description" | "desktop" | "mobile"
  >;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
  alt?: string;
}>;

function posterStyle(
  poster: CinematicPoster,
  mobile?: CinematicPoster,
): PosterStyle {
  return {
    aspectRatio: `${poster.width} / ${poster.height}`,
    "--cinematic-focal-point": poster.focalPoint ?? "50% 50%",
    "--cinematic-mobile-focal-point": mobile?.focalPoint ??
      poster.focalPoint ?? "50% 50%",
  };
}

/**
 * Server-rendered source of truth for every cinematic film. Motion is always a
 * progressive enhancement over this responsive, meaningful still frame.
 */
export function AccessibleFilmPoster({
  asset,
  className = "",
  decorative = false,
  priority = false,
  alt,
}: AccessibleFilmPosterProps) {
  const desktop = asset.desktop.poster;
  const mobile = asset.mobile?.poster;
  const alternativeText = decorative
    ? ""
    : (alt ?? `${asset.title}. ${asset.description}`);

  return (
    <picture
      className={`${styles.poster} ${className}`.trim()}
      style={posterStyle(desktop, mobile)}
      data-cinematic-poster="true"
    >
      {mobile && (
        <source
          media="(max-width: 720px)"
          srcSet={mobile.src}
          width={mobile.width}
          height={mobile.height}
        />
      )}
      <img
        src={desktop.src}
        alt={alternativeText}
        width={desktop.width}
        height={desktop.height}
        sizes="100vw"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
