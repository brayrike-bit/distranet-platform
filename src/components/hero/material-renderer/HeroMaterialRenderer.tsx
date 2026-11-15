"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import type { HeroMaterialMotionRef } from "./motion";
import styles from "./heroMaterialRenderer.module.css";

const MAX_DPR = 1.5;
const MAX_BACKING_SIZE = 2048;
const PARALLAX_LIMIT = 0.008;

type NavigatorWithSignals = Navigator & {
  deviceMemory?: number;
  connection?: EventTarget & { saveData?: boolean; effectiveType?: string };
};

function supportsMaterialRenderer() {
  const nav = navigator as NavigatorWithSignals;
  const connection = nav.connection;
  return !(
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g" ||
    (navigator.hardwareConcurrency ?? 4) < 4 ||
    (nav.deviceMemory ?? 4) < 4
  );
}

const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uBeauty;
uniform sampler2D uDepth;
uniform sampler2D uNormal;
uniform sampler2D uSpecular;
uniform sampler2D uEmission;
uniform vec2 uViewport;
uniform vec2 uImageSize;
uniform vec2 uPointer;
uniform float uProgress;
uniform float uHasEmission;

vec2 coverUv(vec2 uv) {
  float viewportAspect = uViewport.x / max(1.0, uViewport.y);
  float imageAspect = uImageSize.x / max(1.0, uImageSize.y);

  if (viewportAspect > imageAspect) {
    uv.y = (uv.y - 0.5) * (imageAspect / viewportAspect) + 0.5;
  } else {
    uv.x = (uv.x - 0.5) * (viewportAspect / imageAspect) + 0.5;
  }
  return uv;
}

vec3 toLinear(vec3 color) {
  return pow(max(color, vec3(0.0)), vec3(2.2));
}

vec3 toDisplay(vec3 color) {
  return pow(max(color, vec3(0.0)), vec3(1.0 / 2.2));
}

void main() {
  vec2 baseUv = coverUv(vUv);
  float depth = texture(uDepth, baseUv).r;
  float depthOffset = clamp((depth - 0.5) * 2.0, -1.0, 1.0);
  vec2 parallax = clamp(
    uPointer * depthOffset * ${PARALLAX_LIMIT.toFixed(3)},
    vec2(-${PARALLAX_LIMIT.toFixed(3)}),
    vec2(${PARALLAX_LIMIT.toFixed(3)})
  );
  vec2 uv = clamp(baseUv + parallax, vec2(0.001), vec2(0.999));

  vec4 beautySample = texture(uBeauty, uv);
  vec3 color = toLinear(beautySample.rgb);

  vec3 normal = texture(uNormal, uv).xyz * 2.0 - 1.0;
  normal.xy *= 0.68;
  normal = normalize(normal);

  float specularMask = texture(uSpecular, uv).r;
  vec3 lightDirection = normalize(vec3(
    -0.18 + uPointer.x * 0.32,
    0.42 - uPointer.y * 0.22,
    0.90
  ));
  vec3 viewDirection = vec3(0.0, 0.0, 1.0);
  vec3 halfDirection = normalize(lightDirection + viewDirection);

  float diffuse = max(dot(normal, lightDirection), 0.0);
  float softbox = pow(max(dot(normal, halfDirection), 0.0), 10.0);
  float relight = (diffuse - 0.68) * 0.18;
  relight += softbox * specularMask * 0.10;
  relight = clamp(relight, -0.08, 0.16);
  color *= 1.0 + relight;

  vec3 emission = toLinear(texture(uEmission, uv).rgb);
  float emissionReveal = smoothstep(0.08, 0.72, uProgress);
  float emissionStrength = min(0.12, 0.025 + emissionReveal * 0.095);
  color += emission * emissionStrength * uHasEmission;

  outColor = vec4(toDisplay(color), beautySample.a);
}`;

type TextureKey = "beauty" | "depth" | "normal" | "specular" | "emission";

type LoadedMaterialImages = {
  beauty: HTMLImageElement;
  depth: HTMLImageElement;
  normal: HTMLImageElement;
  specular: HTMLImageElement;
  emission: HTMLImageElement | null;
};

type MaterialTextures = {
  beauty: WebGLTexture;
  depth: WebGLTexture;
  normal: WebGLTexture;
  specular: WebGLTexture;
  emission: WebGLTexture;
};

type Uniforms = {
  beauty: WebGLUniformLocation;
  depth: WebGLUniformLocation;
  normal: WebGLUniformLocation;
  specular: WebGLUniformLocation;
  emission: WebGLUniformLocation;
  viewport: WebGLUniformLocation;
  imageSize: WebGLUniformLocation;
  pointer: WebGLUniformLocation;
  progress: WebGLUniformLocation;
  hasEmission: WebGLUniformLocation;
};

export type HeroMaterialRendererHandle = {
  /** Wake the renderer after a programmatic motionRef mutation. */
  invalidate: () => void;
};

export type HeroMaterialRendererProps = {
  motionRef: HeroMaterialMotionRef;
  className?: string;
  /** Folder containing end-{beauty,depth,normal,specular,emission}-v1.webp/png. */
  assetBasePath?: string;
  onReady?: () => void;
  onFailure?: (error: Error) => void;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to allocate a WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Unknown shader compilation error.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    throw new Error("Unable to allocate the hero WebGL program.");
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "Unknown WebGL program link error.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function requireUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
) {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`Missing hero shader uniform: ${name}`);
  return location;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load material texture: ${url}`));
    image.src = url;
  });
}

async function loadTextureCandidate(basePath: string, key: TextureKey) {
  const urls = [
    `${basePath}/end-${key}-v1.webp`,
    `${basePath}/end-${key}-v1.png`,
  ];
  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      return await loadImage(url);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }
  throw lastError ?? new Error(`No ${key} material texture was available.`);
}

async function loadMaterialImages(basePath: string): Promise<LoadedMaterialImages> {
  const [beauty, depth, normal, specular] = await Promise.all([
    loadTextureCandidate(basePath, "beauty"),
    loadTextureCandidate(basePath, "depth"),
    loadTextureCandidate(basePath, "normal"),
    loadTextureCandidate(basePath, "specular"),
  ]);
  // This scene intentionally has no emissive material. Avoid two guaranteed
  // 404s before the material pass can become ready.
  return { beauty, depth, normal, specular, emission: null };
}

function createTexture(gl: WebGL2RenderingContext, image: HTMLImageElement) {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Unable to allocate a hero material texture.");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image,
  );
  return texture;
}

function createBlackTexture(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Unable to allocate the emission fallback texture.");
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA8,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255]),
  );
  return texture;
}

function createMaterialTextures(
  gl: WebGL2RenderingContext,
  images: LoadedMaterialImages,
): MaterialTextures {
  return {
    beauty: createTexture(gl, images.beauty),
    depth: createTexture(gl, images.depth),
    normal: createTexture(gl, images.normal),
    specular: createTexture(gl, images.specular),
    emission: images.emission
      ? createTexture(gl, images.emission)
      : createBlackTexture(gl),
  };
}

export const HeroMaterialRenderer = forwardRef<
  HeroMaterialRendererHandle,
  HeroMaterialRendererProps
>(function HeroMaterialRenderer(
  {
    motionRef,
    className,
    assetBasePath = "/hero/network-machine/v2",
    onReady,
    onFailure,
  },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const invalidateRef = useRef<() => void>(() => undefined);
  const onReadyRef = useRef(onReady);
  const onFailureRef = useRef(onFailure);
  const [rendererAllowed, setRendererAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useImperativeHandle(
    forwardedRef,
    () => ({ invalidate: () => invalidateRef.current() }),
    [],
  );

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    onFailureRef.current = onFailure;
  }, [onFailure]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const narrow = window.matchMedia("(max-width: 720px)");
    const connection = (navigator as NavigatorWithSignals).connection;
    const update = () => setRendererAllowed(
      !reduced.matches &&
      !coarse.matches &&
      !narrow.matches &&
      document.body.dataset.renderQuality !== "static" &&
      supportsMaterialRenderer(),
    );
    const qualityObserver = new MutationObserver(update);
    update();
    reduced.addEventListener("change", update);
    coarse.addEventListener("change", update);
    narrow.addEventListener("change", update);
    connection?.addEventListener("change", update);
    qualityObserver.observe(document.body, { attributes: true, attributeFilter: ["data-render-quality"] });
    return () => {
      reduced.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
      narrow.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
      qualityObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererAllowed) {
      invalidateRef.current = () => undefined;
      setReady(false);
      return;
    }

    let disposed = false;
    let visible = false;
    let texturesReady = false;
    let animationFrame = 0;
    let gl: WebGL2RenderingContext | null = null;
    let program: WebGLProgram | null = null;
    let vertexArray: WebGLVertexArrayObject | null = null;
    let vertexBuffer: WebGLBuffer | null = null;
    let textures: MaterialTextures | null = null;
    let uniforms: Uniforms | null = null;
    let imageWidth = 1;
    let imageHeight = 1;
    let viewportWidth = 1;
    let viewportHeight = 1;

    const fail = (cause: unknown) => {
      if (disposed) return;
      disposed = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      const error = cause instanceof Error ? cause : new Error(String(cause));
      canvas.dataset.materialError = error.message;
      canvas.hidden = true;
      setFailed(true);
      setReady(false);
      onFailureRef.current?.(error);
    };

    const resize = (cssWidth: number, cssHeight: number) => {
      if (!gl || cssWidth <= 0 || cssHeight <= 0) return;
      const cappedDpr = Math.min(
        window.devicePixelRatio || 1,
        MAX_DPR,
        MAX_BACKING_SIZE / cssWidth,
        MAX_BACKING_SIZE / cssHeight,
      );
      const width = Math.max(1, Math.round(cssWidth * cappedDpr));
      const height = Math.max(1, Math.round(cssHeight * cappedDpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      viewportWidth = width;
      viewportHeight = height;
      gl.viewport(0, 0, width, height);
    };

    const draw = () => {
      if (!gl || !program || !vertexArray || !textures || !uniforms) return;
      gl.useProgram(program);
      gl.bindVertexArray(vertexArray);

      const textureEntries: Array<[WebGLTexture, WebGLUniformLocation]> = [
        [textures.beauty, uniforms.beauty],
        [textures.depth, uniforms.depth],
        [textures.normal, uniforms.normal],
        [textures.specular, uniforms.specular],
        [textures.emission, uniforms.emission],
      ];
      textureEntries.forEach(([texture, location], index) => {
        gl?.activeTexture(gl.TEXTURE0 + index);
        gl?.bindTexture(gl.TEXTURE_2D, texture);
        gl?.uniform1i(location, index);
      });

      gl.uniform2f(uniforms.viewport, viewportWidth, viewportHeight);
      gl.uniform2f(uniforms.imageSize, imageWidth, imageHeight);
      const target = motionRef.current;
      gl.uniform2f(
        uniforms.pointer,
        clamp(target.pointerX, -1, 1),
        clamp(target.pointerY, -1, 1),
      );
      gl.uniform1f(uniforms.progress, clamp(target.scrollProgress, 0, 1));
      gl.uniform1f(uniforms.hasEmission, imagesHaveEmission ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindVertexArray(null);
    };

    let imagesHaveEmission = false;

    const tick = () => {
      animationFrame = 0;
      if (disposed || !visible || document.hidden || !texturesReady) return;
      draw();
    };

    const invalidate = () => {
      if (
        disposed ||
        !visible ||
        document.hidden ||
        !texturesReady ||
        animationFrame
      ) return;
      animationFrame = requestAnimationFrame(tick);
    };
    invalidateRef.current = invalidate;

    const onContextLost = (event: Event) => {
      event.preventDefault();
      fail(new Error("The hero WebGL context was lost."));
    };
    canvas.addEventListener("webglcontextlost", onContextLost, { once: true });

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) invalidate();
        else if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
      },
      { threshold: [0, 0.01] },
    );
    intersectionObserver.observe(canvas);

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      resize(entry.contentRect.width, entry.contentRect.height);
      invalidate();
    });
    resizeObserver.observe(canvas);

    const onVisibility = () => {
      if (document.hidden && animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        invalidate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const initialize = async () => {
      try {
        gl = canvas.getContext("webgl2", {
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
          desynchronized: true,
          powerPreference: "high-performance",
          premultipliedAlpha: false,
        });
        if (!gl) throw new Error("WebGL2 is unavailable for the hero material pass.");

        program = createProgram(gl);
        vertexArray = gl.createVertexArray();
        vertexBuffer = gl.createBuffer();
        if (!vertexArray || !vertexBuffer) {
          throw new Error("Unable to allocate the hero fullscreen quad.");
        }

        gl.bindVertexArray(vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        );
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.bindVertexArray(null);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);

        uniforms = {
          beauty: requireUniform(gl, program, "uBeauty"),
          depth: requireUniform(gl, program, "uDepth"),
          normal: requireUniform(gl, program, "uNormal"),
          specular: requireUniform(gl, program, "uSpecular"),
          emission: requireUniform(gl, program, "uEmission"),
          viewport: requireUniform(gl, program, "uViewport"),
          imageSize: requireUniform(gl, program, "uImageSize"),
          pointer: requireUniform(gl, program, "uPointer"),
          progress: requireUniform(gl, program, "uProgress"),
          hasEmission: requireUniform(gl, program, "uHasEmission"),
        };

        const images = await loadMaterialImages(assetBasePath.replace(/\/$/, ""));
        if (disposed) return;
        textures = createMaterialTextures(gl, images);
        imagesHaveEmission = Boolean(images.emission);
        imageWidth = images.beauty.naturalWidth;
        imageHeight = images.beauty.naturalHeight;
        texturesReady = true;

        const bounds = canvas.getBoundingClientRect();
        resize(bounds.width, bounds.height);
        setReady(true);
        onReadyRef.current?.();
        invalidate();
      } catch (error) {
        fail(error);
      }
    };
    void initialize();

    return () => {
      disposed = true;
      invalidateRef.current = () => undefined;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("webglcontextlost", onContextLost);

      if (gl) {
        if (textures) Object.values(textures).forEach((texture) => gl?.deleteTexture(texture));
        if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
        if (vertexArray) gl.deleteVertexArray(vertexArray);
        if (program) gl.deleteProgram(program);
      }
    };
  }, [assetBasePath, motionRef, rendererAllowed]);

  const classes = [
    styles.canvas,
    ready && styles.ready,
    (!rendererAllowed || failed) && styles.hidden,
    className,
  ].filter(Boolean).join(" ");

  return (
    <canvas
      ref={canvasRef}
      className={classes}
      aria-hidden="true"
      tabIndex={-1}
      hidden={!rendererAllowed || failed}
    />
  );
});
