export type PublicCinemaVideoType = "video/webm" | "video/mp4";

export type PublicCinemaVideoSource = Readonly<{
  src: string;
  type: PublicCinemaVideoType;
}>;

export type PublicCinemaPoster = Readonly<{
  src: string;
  width: number;
  height: number;
  focalPoint?: string;
}>;

export type PublicCinemaVariant = Readonly<{
  poster: PublicCinemaPoster;
  sources: readonly PublicCinemaVideoSource[];
}>;

export type PublicCinemaBeat = Readonly<{
  id: string;
  label: string;
  progress: number;
  description: string;
}>;

export type PublicCinemaDelivery =
  | "planned"
  | "poster-ready"
  | "plate-ready"
  | "ready";

export type PublicCinemaChapter = Readonly<{
  id: string;
  index: string;
  label: string;
  eyebrow: string;
  title: string;
  accent: string;
  summary: string;
  href: string;
  action: string;
  facts: readonly string[];
  durationSeconds: number;
  fps: number;
  runwayVh: number;
  desktop: PublicCinemaVariant;
  mobile?: PublicCinemaVariant;
  beats: readonly PublicCinemaBeat[];
  delivery: PublicCinemaDelivery;
}>;

