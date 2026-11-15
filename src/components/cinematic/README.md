# Cinematic interaction foundation

`ScrollScrubFilm` owns a sticky scroll runway and maps its normalized progress
directly to the authored film time. It pauses the video permanently; scroll is
the transport. `requestVideoFrameCallback` exposes the last decoded frame in
`data-rendered-time` for browser QA.

```tsx
import {
  distranetCinematicMedia,
  PointerDepthLayer,
  PointerDepthStage,
  ScrollScrubFilm,
} from "@/components/cinematic";

<ScrollScrubFilm
  asset={distranetCinematicMedia.homeNetworkIgnition}
  scrollSpanVh={360}
  stickyTop="84px"
  priority
>
  <PointerDepthStage className={styles.heroLayers}>
    <PointerDepthLayer depth={-0.55}>{/* atmosphere */}</PointerDepthLayer>
    <PointerDepthLayer depth={0}>
      {/* stable brand/copy plane */}
    </PointerDepthLayer>
    <PointerDepthLayer depth={0.7}>{/* network signal */}</PointerDepthLayer>
    <PointerDepthLayer depth={1}>{/* foreground optics */}</PointerDepthLayer>
  </PointerDepthStage>
</ScrollScrubFilm>;
```

The component server-renders a responsive poster before any client capability
check. Reduced motion, Save-Data, slow-network, and low-memory policies never
mount the video; coarse pointers retain scroll behavior but do not receive
pointer depth. Meaningful films should pass `decorative={false}` so their title
and description remain available to assistive technology.

Manifest delivery states are evidence, not aspiration:

- `planned`: neither final poster nor film is approved.
- `poster-ready`: a verified fallback still exists; the film path is a contract.
- `plate-ready`: a verified motion plate exists but deterministic logo/type
  compositing is still pending.
- `ready`: the final branded master and poster have passed visual review.

Only `ready` media may claim baked branding. Keep official Distranet/member SVG
marks in a stable zero-depth DOM layer during development, then bake exact marks
into release video pixels during deterministic finishing.
