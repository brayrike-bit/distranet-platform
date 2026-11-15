type PublicFilmFrameSubscriber = (
  time: number,
  pageVisible: boolean,
) => boolean | void;

const subscribers = new Set<PublicFilmFrameSubscriber>();

let frame = 0;
let listening = false;

function runFrame(time: number) {
  frame = 0;
  if (document.hidden) return;

  let needsAnotherFrame = false;
  subscribers.forEach((subscriber) => {
    needsAnotherFrame = subscriber(time, true) === true || needsAnotherFrame;
  });

  if (needsAnotherFrame) requestPublicFilmFrame();
}

export function requestPublicFilmFrame() {
  if (frame || typeof window === "undefined" || document.hidden) return;
  frame = window.requestAnimationFrame(runFrame);
}

function handleViewportSignal() {
  requestPublicFilmFrame();
}

function handleVisibilityChange() {
  if (document.hidden) {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    const time = performance.now();
    subscribers.forEach((subscriber) => subscriber(time, false));
    return;
  }

  requestPublicFilmFrame();
}

function startListening() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("scroll", handleViewportSignal, { passive: true });
  window.addEventListener("resize", handleViewportSignal, { passive: true });
  window.visualViewport?.addEventListener("resize", handleViewportSignal, {
    passive: true,
  });
  document.addEventListener("visibilitychange", handleVisibilityChange);
}

function stopListening() {
  if (!listening || typeof window === "undefined") return;
  listening = false;
  window.removeEventListener("scroll", handleViewportSignal);
  window.removeEventListener("resize", handleViewportSignal);
  window.visualViewport?.removeEventListener("resize", handleViewportSignal);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (frame) window.cancelAnimationFrame(frame);
  frame = 0;
}

/**
 * One requestAnimationFrame clock drives every public film chapter on a route.
 * Scroll/resize handlers only wake the clock; DOM reads, choreography writes,
 * and decoder seek admission all happen together inside the frame callback.
 */
export function subscribePublicFilmFrame(
  subscriber: PublicFilmFrameSubscriber,
) {
  subscribers.add(subscriber);
  startListening();
  requestPublicFilmFrame();

  return () => {
    subscribers.delete(subscriber);
    if (subscribers.size === 0) stopListening();
  };
}
