"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type CSSProperties } from "react";

type CinematicWorldProps = {
  className?: string;
  progress?: number;
  style?: CSSProperties;
};

type NetworkInformation = EventTarget & {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation;
  deviceMemory?: number;
};

const importSignalWorld = () => import("./SignalWorld");
const importOrderRouterWorld = () => import("./OrderRouterWorld");
const importProcurementWorld = () => import("./ProcurementWorld");
const importInventoryExchangeWorld = () => import("./InventoryExchangeWorld");
const importNetworkEvolutionWorld = () => import("./NetworkEvolutionWorld");
const importMemberDockingWorld = () => import("./MemberDockingWorld");

const DynamicSignalWorld = dynamic(
  () => importSignalWorld().then((module) => module.SignalWorld),
  { ssr: false },
);
const DynamicOrderRouterWorld = dynamic(
  () => importOrderRouterWorld().then((module) => module.OrderRouterWorld),
  { ssr: false },
);
const DynamicProcurementWorld = dynamic(
  () => importProcurementWorld().then((module) => module.ProcurementWorld),
  { ssr: false },
);
const DynamicInventoryExchangeWorld = dynamic(
  () => importInventoryExchangeWorld().then((module) => module.InventoryExchangeWorld),
  { ssr: false },
);
const DynamicNetworkEvolutionWorld = dynamic(
  () => importNetworkEvolutionWorld().then((module) => module.NetworkEvolutionWorld),
  { ssr: false },
);
const DynamicMemberDockingWorld = dynamic(
  () => importMemberDockingWorld().then((module) => module.MemberDockingWorld),
  { ssr: false },
);

function readCinematicCapability() {
  if (typeof window === "undefined") return false;

  const nav = navigator as NavigatorWithConnection;
  const connection = nav.connection;
  const constrainedConnection = Boolean(
    connection?.saveData ||
    connection?.effectiveType === "slow-2g" ||
    connection?.effectiveType === "2g",
  );
  const lowEnd =
    (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency < 4) ||
    (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4);

  return (
    window.innerWidth > 680 &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !constrainedConnection &&
    !lowEnd
  );
}

function useLoadedCinematicWorld(loader: () => Promise<unknown>) {
  const [capable, setCapable] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as NavigatorWithConnection).connection;

    const update = () => setCapable(readCinematicCapability());
    update();

    window.addEventListener("resize", update, { passive: true });
    pointer.addEventListener("change", update);
    reducedMotion.addEventListener("change", update);
    connection?.addEventListener("change", update);

    return () => {
      window.removeEventListener("resize", update);
      pointer.removeEventListener("change", update);
      reducedMotion.removeEventListener("change", update);
      connection?.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!capable || loaded) return;
    let cancelled = false;
    loader().then(() => {
      if (!cancelled) setLoaded(true);
    }).catch(() => {
      // Keep the faithful poster if an optional cinematic chunk cannot load.
    });
    return () => {
      cancelled = true;
    };
  }, [capable, loaded, loader]);

  return capable && loaded;
}

function SignalPoster({ className = "", style }: CinematicWorldProps) {
  return (
    <div className={`signal-world real-asset cine-world is-poster ${className}`.trim()} aria-hidden="true" data-quality="static" style={style}>
      <div className="signal-world-poster cine-world-poster" />
    </div>
  );
}

function OrderRouterPoster({ className = "", style }: CinematicWorldProps) {
  return (
    <div className={`order-router-world cine-world is-poster ${className}`.trim()} aria-hidden="true" data-quality="static" style={style}>
      <div className="order-router-poster cine-world-poster" />
    </div>
  );
}

function ProcurementPoster({ className = "", style }: CinematicWorldProps) {
  return (
    <div className={`procurement-world cine-world is-poster ${className}`.trim()} aria-hidden="true" data-quality="static" style={style}>
      <div className="procurement-poster cine-world-poster" />
    </div>
  );
}

function InventoryExchangePoster({ className = "", style }: CinematicWorldProps) {
  return (
    <div
      className={`inventory-exchange-world real-asset cine-world is-poster ${className}`.trim()}
      aria-hidden="true"
      data-reduced-motion="true"
      data-quality="static"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", ...style }}
    >
      <div
        className="inventory-exchange-poster cine-world-poster"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/renders/distranet-inventory-exchange.webp)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          opacity: 0.9,
        }}
      />
    </div>
  );
}

function NetworkEvolutionPoster({ className = "", style }: CinematicWorldProps) {
  return (
    <div
      className={`network-evolution-world cine-world is-poster ${className}`.trim()}
      aria-hidden="true"
      data-quality="static"
      style={{ position: "absolute", inset: 0, minHeight: 480, overflow: "hidden", pointerEvents: "none", ...style }}
    >
      <img
        src="/renders/distranet-network-evolution.webp"
        alt=""
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "62% 50%",
          opacity: 0.92,
          filter: "saturate(1.05) contrast(1.04)",
          userSelect: "none",
        }}
      />
    </div>
  );
}

function MemberDockingPoster({ className = "", style }: CinematicWorldProps) {
  return (
    <div
      className={`member-docking-world real-asset cine-world is-poster ${className}`.trim()}
      aria-hidden="true"
      data-quality="static"
      style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", ...style }}
    >
      <div
        className="member-docking-poster cine-world-poster"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/renders/distranet-member-docking.webp)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: 0.96,
        }}
      />
    </div>
  );
}

export function SignalWorld(props: CinematicWorldProps = {}) {
  const live = useLoadedCinematicWorld(importSignalWorld);
  return live ? <DynamicSignalWorld /> : <SignalPoster {...props} />;
}

export function OrderRouterWorld(props: CinematicWorldProps = {}) {
  const live = useLoadedCinematicWorld(importOrderRouterWorld);
  return live ? <DynamicOrderRouterWorld /> : <OrderRouterPoster {...props} />;
}

export function ProcurementWorld(props: CinematicWorldProps = {}) {
  const live = useLoadedCinematicWorld(importProcurementWorld);
  return live ? <DynamicProcurementWorld /> : <ProcurementPoster {...props} />;
}

export function InventoryExchangeWorld({ className, progress, style }: CinematicWorldProps = {}) {
  const live = useLoadedCinematicWorld(importInventoryExchangeWorld);
  return live
    ? <DynamicInventoryExchangeWorld className={className} progress={progress} style={style} />
    : <InventoryExchangePoster className={className} progress={progress} style={style} />;
}

export function NetworkEvolutionWorld({ className, style }: Omit<CinematicWorldProps, "progress"> = {}) {
  const live = useLoadedCinematicWorld(importNetworkEvolutionWorld);
  return live
    ? <DynamicNetworkEvolutionWorld className={className} style={style} />
    : <NetworkEvolutionPoster className={className} style={style} />;
}

export function MemberDockingWorld(props: Omit<CinematicWorldProps, "progress"> = {}) {
  const live = useLoadedCinematicWorld(importMemberDockingWorld);
  return live ? <DynamicMemberDockingWorld /> : <MemberDockingPoster {...props} />;
}
