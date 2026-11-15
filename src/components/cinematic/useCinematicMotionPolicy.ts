"use client";

import { useEffect, useState } from "react";

type NetworkInformation = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithCapabilities = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

export type CinematicMotionPolicy = Readonly<{
  ready: boolean;
  allowMotion: boolean;
  reducedMotion: boolean;
  finePointer: boolean;
  constrained: boolean;
  reason:
    | "initializing"
    | "allowed"
    | "reduced-motion"
    | "save-data"
    | "slow-network"
    | "low-memory";
}>;

const initialPolicy: CinematicMotionPolicy = {
  ready: false,
  allowMotion: false,
  reducedMotion: true,
  finePointer: false,
  constrained: false,
  reason: "initializing",
};

export function useCinematicMotionPolicy(): CinematicMotionPolicy {
  const [policy, setPolicy] = useState<CinematicMotionPolicy>(initialPolicy);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const navigatorWithCapabilities = navigator as NavigatorWithCapabilities;
    const connection = navigatorWithCapabilities.connection;

    const update = () => {
      const slowNetwork = /(^|-)2g$/.test(connection?.effectiveType ?? "");
      const saveData = Boolean(connection?.saveData);
      const lowMemory =
        typeof navigatorWithCapabilities.deviceMemory === "number" &&
        navigatorWithCapabilities.deviceMemory < 4;

      let reason: CinematicMotionPolicy["reason"] = "allowed";
      if (reduced.matches) reason = "reduced-motion";
      else if (saveData) reason = "save-data";
      else if (slowNetwork) reason = "slow-network";
      else if (lowMemory) reason = "low-memory";

      const constrained = saveData || slowNetwork || lowMemory;
      setPolicy({
        ready: true,
        allowMotion: !reduced.matches && !constrained,
        reducedMotion: reduced.matches,
        finePointer: finePointer.matches,
        constrained,
        reason,
      });
    };

    update();
    reduced.addEventListener("change", update);
    finePointer.addEventListener("change", update);
    connection?.addEventListener("change", update);

    return () => {
      reduced.removeEventListener("change", update);
      finePointer.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  return policy;
}
