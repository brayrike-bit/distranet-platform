import type { MemberSlug } from "@/domain/member-hub/types";
import type { CinematicFilmAsset } from "@/components/cinematic/mediaManifest";

/** Only finished, visually reviewed exports belong here. Raw AI jobs do not. */
export const MEMBER_FINISHED_FILMS: Partial<Record<MemberSlug, CinematicFilmAsset>> = {
  "kundinger": {
    id: "member-kundinger-seedance25-2026-11-11",
    title: "Kundinger and Distranet — complete controls module",
    description: "A front-facing camera pass across a complete stationary controls module, with the original Kundinger and Distranet marks tracked into its fascia and front plaque. An illustrative brand visualization, not an actual facility or certified assembly.",
    durationSeconds: 211 / 24,
    desktop: {
      id: "kundinger-seedance25-20261111-1080p-gop6",
      poster: { src: "/media/cinematic/member-kundinger-seedance25-2026-11-11/poster.jpg", width: 960, height: 540, focalPoint: "50% 50%" },
      sources: [{ src: "/media/cinematic/member-kundinger-seedance25-2026-11-11/desktop.mp4", type: "video/mp4" }],
    },
    // Keep the whole frame on mobile; a narrow crop would cut the exhibit or marks.
    beats: [
      { id: "identity", progress: 0, label: "Your identity", description: "Both original brand marks are visible on the physical exhibit." },
      { id: "detail", progress: .48, label: "Applied expertise", description: "The stationary equipment remains complete during the camera pass." },
      { id: "workspace", progress: .85, label: "Your operating view", description: "From your brand to a clearly labeled illustrative dashboard." },
    ],
    delivery: { status: "ready", visualSource: "hybrid", branding: "baked" },
  },
  "triad-technologies": {
    id: "member-triad-seedance25-2026-11-11",
    title: "Triad Technologies and Distranet — fluid conveyance",
    description: "A continuous photographic view of a fixed hose-and-tube cassette, with the exact Triad Technologies and Distranet marks baked into its two physical faces. An illustrative brand visualization, not an actual facility or certified assembly.",
    durationSeconds: 241 / 24,
    desktop: {
      id: "triad-seedance25-20261111-1080p-gop6",
      poster: { src: "/media/cinematic/member-triad-seedance25-2026-11-11/poster.jpg", width: 960, height: 540, focalPoint: "50% 50%" },
      sources: [{ src: "/media/cinematic/member-triad-seedance25-2026-11-11/desktop.mp4", type: "video/mp4" }],
    },
    // Keep the whole frame on mobile; a narrow crop would cut the exhibit or marks.
    beats: [
      { id: "identity", progress: 0, label: "Your identity", description: "Both original brand marks are visible on the physical exhibit." },
      { id: "detail", progress: .48, label: "Applied expertise", description: "The stationary equipment remains complete during the camera pass." },
      { id: "workspace", progress: .85, label: "Your operating view", description: "From your brand to a clearly labeled illustrative dashboard." },
    ],
    delivery: { status: "ready", visualSource: "hybrid", branding: "baked" },
  },
  "mfp-automation-engineering": {
    id: "member-mfp-seedance25-2026-11-11",
    title: "MFP Automation Engineering and Distranet — motion and control",
    description: "A slow camera pass around an assembled manifold and cylinder display. The exact MFP Automation Engineering and Distranet marks are baked into separate physical surfaces. An illustrative brand visualization, not an actual facility or certified assembly.",
    durationSeconds: 241 / 24,
    desktop: {
      id: "mfp-seedance25-20261111-1080p-gop6",
      poster: { src: "/media/cinematic/member-mfp-seedance25-2026-11-11/poster.jpg", width: 960, height: 540, focalPoint: "50% 50%" },
      sources: [{ src: "/media/cinematic/member-mfp-seedance25-2026-11-11/desktop.mp4", type: "video/mp4" }],
    },
    // Keep the whole frame on mobile; a narrow crop would cut the exhibit or marks.
    beats: [
      { id: "identity", progress: 0, label: "Your identity", description: "Both original brand marks are visible on the physical exhibit." },
      { id: "detail", progress: .48, label: "Applied expertise", description: "The stationary equipment remains complete during the camera pass." },
      { id: "workspace", progress: .85, label: "Your operating view", description: "From your brand to a clearly labeled illustrative dashboard." },
    ],
    delivery: { status: "ready", visualSource: "hybrid", branding: "baked" },
  },
  "afp-industries": {
    id: "member-afp-industries-seedance25-2026-11-11",
    title: "AFP Industries and Distranet — applied expertise",
    description: "A photographic front-side pass across a stationary pump inspection exhibit and complete air-service assembly. The original AFP Industries and Distranet source marks are tracked into separate physical plaques inside the MP4. Conceptual brand visualization, not a claimed actual facility, rated product or certified test result.",
    durationSeconds: 241 / 24,
    desktop: {
      id: "afp-seedance25-20261111-1080p-gop6",
      poster: { src: "/media/cinematic/member-afp-seedance25-2026-11-11/poster.jpg", width: 960, height: 540, focalPoint: "50% 50%" },
      sources: [{ src: "/media/cinematic/member-afp-seedance25-2026-11-11/desktop.mp4", type: "video/mp4" }],
    },
    beats: [
      { id: "expertise", progress: 0, label: "Your identity", description: "The original AFP Industries mark is centered on its physical company plaque." },
      { id: "detail", progress: .48, label: "Applied expertise", description: "Complete, stationary equipment and seated connections stay inside the frame." },
      { id: "workspace", progress: .85, label: "Your operating view", description: "Your brand leads into a clear view of aggregate member contribution." },
    ],
    delivery: { status: "ready", visualSource: "hybrid", branding: "baked" },
  },
  "aberdeen-dynamics": {
    id: "member-aberdeen-dynamics-seedance25-2026-11-11",
    title: "Aberdeen Dynamics and Distranet — connected engineering",
    description: "A front-side photographic camera pass across a complete systems bench: hydraulic power module, pneumatic fixture and supported linear stage. Exact original Aberdeen Dynamics and Distranet marks are tracked into physical plaques inside the MP4. A conceptual brand exhibit, not an actual facility, rated product or certified assembly.",
    durationSeconds: 241 / 24,
    desktop: {
      id: "aberdeen-seedance25-20261111-1080p-gop6",
      poster: { src: "/media/cinematic/member-aberdeen-seedance25-2026-11-11/poster.jpg", width: 960, height: 540, focalPoint: "50% 50%" },
      sources: [{ src: "/media/cinematic/member-aberdeen-seedance25-2026-11-11/desktop.mp4", type: "video/mp4" }],
    },
    // The complete wide bench is deliberately retained on mobile; no hardware-clipping crop.
    beats: [
      { id: "engineering", progress: 0, label: "Your identity", description: "The original Aberdeen Dynamics mark above a complete systems exhibit." },
      { id: "capability", progress: .48, label: "Connected capability", description: "Three distinct, stationary systems remain visible throughout the camera pass." },
      { id: "workspace", progress: .85, label: "Your operating view", description: "A calm handoff from your member identity to aggregate reporting." },
    ],
    delivery: { status: "ready", visualSource: "hybrid", branding: "baked" },
  },
  "connector-specialists": {
    id: "member-connector-specialists-seedance25-photo-2026-11-11",
    title: "Connector Specialists and Distranet — precision connections",
    description: "A photographic front-side camera pass across two complete, stationary hose loops and four seated termination groups. Both original brand marks are proportionally contained and tracked into separate physical plaques in the MP4. This is a conceptual brand visualization, not a rated product, engineering instruction or certified installation.",
    durationSeconds: 241 / 24,
    desktop: {
      id: "csi-seedance25-photo-20261111-1080p-gop6",
      poster: { src: "/media/cinematic/member-csi-seedance25-photo-2026-11-11/poster.jpg", width: 960, height: 540, focalPoint: "50% 50%" },
      sources: [{ src: "/media/cinematic/member-csi-seedance25-photo-2026-11-11/desktop.mp4", type: "video/mp4" }],
    },
    mobile: {
      id: "csi-seedance25-photo-20261111-mobile-8x9-gop6",
      poster: { src: "/media/cinematic/member-csi-seedance25-photo-2026-11-11/poster-mobile.jpg", width: 480, height: 540, focalPoint: "50% 50%" },
      sources: [{ src: "/media/cinematic/member-csi-seedance25-photo-2026-11-11/mobile.mp4", type: "video/mp4" }],
    },
    beats: [
      { id: "precision", progress: 0, label: "Your identity", description: "The authentic Connector Specialists mark is visible above the complete assembly." },
      { id: "connection", progress: .48, label: "Connected strength", description: "Two complete hose paths remain visibly traceable between four stationary, seated terminations." },
      { id: "workspace", progress: .85, label: "Your operating view", description: "The camera settles with both brand marks completely inside the frame." },
    ],
    delivery: { status: "ready", visualSource: "hybrid", branding: "baked" },
  },
};
