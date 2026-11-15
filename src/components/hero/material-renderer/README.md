# Hero material renderer

`HeroMaterialRenderer` is a raw WebGL2 fullscreen material pass for the original
Distranet network-machine key art. Its parent must be positioned and must keep a
normal `<picture>` underneath as the LCP, reduced-motion, and failure fallback.

Required files under `/public/hero/network-machine/v2/`:

- `end-beauty-v1.webp` or `.png`
- `end-depth-v1.webp` or `.png`
- `end-normal-v1.webp` or `.png`
- `end-specular-v1.webp` or `.png`
- optional `end-emission-v1.webp` or `.png`

High-frequency inputs are written to a shared ref, not React state. The renderer
wakes automatically for real pointer/scroll events. Call the imperative
`invalidate()` method when inputs change programmatically.

```tsx
const motionRef = useRef({ pointerX: 0, pointerY: 0, scrollProgress: 0 });
const materialRef = useRef<HeroMaterialRendererHandle>(null);

setHeroMaterialPointer(motionRef, x, y, () => materialRef.current?.invalidate());
setHeroMaterialScrollProgress(motionRef, progress, () => materialRef.current?.invalidate());

<HeroMaterialRenderer
  ref={materialRef}
  motionRef={motionRef}
  onFailure={() => setMaterialAvailable(false)}
/>
```

The canvas caps DPR at `1.5` and either backing dimension at `2048px`. It only
requests frames while intersecting and while its pointer/progress springs are
settling. Reduced-motion, missing required maps, WebGL2 failure, and context loss
all hide the canvas so the static picture remains authoritative.
