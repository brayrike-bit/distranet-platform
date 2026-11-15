"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mark } from "./Brand";

const routes = [
  ["00", "Home", "/"],
  ["01", "Collective advantage", "/advantage"],
  ["02", "The network", "/network"],
  ["03", "Parts Gopher", "/parts-gopher"],
  ["04", "Distranet Direct", "/distranet-direct"],
  ["05", "Membership", "/membership"],
  ["06", "About Distranet", "/about"],
];

export function SiteChrome() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const lastFocusedPathRef = useRef(pathname);
  const currentPathRef = useRef(pathname);
  const progressRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const hidden = pathname.startsWith("/member-hub") || pathname.startsWith("/member-access");
  currentPathRef.current = pathname;

  useEffect(() => {
    if (hidden) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
    };
  }, [pathname, hidden]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    // Preserve the browser's normal first-load focus, then announce client-side
    // destinations without jumping the restored scroll position.
    if (lastFocusedPathRef.current === pathname) return;
    lastFocusedPathRef.current = pathname;
    const frame = requestAnimationFrame(() => {
      const main = document.getElementById("main-content");
      if (!main) return;
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const openedPath = pathname;
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    const backgroundSurfaces = Array.from(document.body.children)
      .filter((node): node is HTMLElement => node instanceof HTMLElement)
      .filter((node) => {
        if (node.matches(".site-header, .site-menu, .page-progress")) return false;
        return !["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT"].includes(node.tagName);
      });
    const backgroundState = backgroundSurfaces.map((surface) => ({
      surface,
      inert: surface.hasAttribute("inert"),
      ariaHidden: surface.getAttribute("aria-hidden"),
    }));
    document.body.style.overflow = "hidden";

    backgroundSurfaces.forEach((surface) => {
      surface.setAttribute("inert", "");
      surface.setAttribute("aria-hidden", "true");
    });

    const focusableItems = () => {
      const menuItems = Array.from(menuRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? []);
      return [toggleRef.current, ...menuItems].filter(
        (item): item is HTMLElement => Boolean(item?.getClientRects().length),
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusableItems();
      if (!items.length) return;
      const current = document.activeElement;
      const currentIndex = items.indexOf(current as HTMLElement);
      const nextIndex = event.shiftKey
        ? (currentIndex <= 0 ? items.length - 1 : currentIndex - 1)
        : (currentIndex < 0 || currentIndex === items.length - 1 ? 0 : currentIndex + 1);
      event.preventDefault();
      items[nextIndex].focus();
    };
    window.addEventListener("keydown", onKeyDown);

    const focusFrame = requestAnimationFrame(() => {
      menuRef.current?.querySelector<HTMLElement>('a[href]')?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      backgroundState.forEach(({ surface, inert, ariaHidden }) => {
        if (!inert) surface.removeAttribute("inert");
        if (ariaHidden === null) surface.removeAttribute("aria-hidden");
        else surface.setAttribute("aria-hidden", ariaHidden);
      });
      const focusTarget = restoreFocusRef.current;
      if (currentPathRef.current === openedPath && focusTarget?.isConnected) {
        requestAnimationFrame(() => focusTarget.focus());
      }
    };
  }, [open]);
  if (hidden) return null;

  return <>
    <div className="page-progress" aria-hidden="true"><i ref={progressRef} /></div>
    <header className="site-header" data-editorial="true">
      <Link href="/" className="site-brand" tabIndex={open ? -1 : undefined} aria-hidden={open ? true : undefined}><Mark tone="light" /></Link>
      <div className="site-header-center" aria-hidden="true"><i /><span>Independent strength. Connected.</span><i /></div>
      <div className="site-header-actions">
        <Link
          href="/member-access"
          className="portal-link"
          tabIndex={open ? -1 : undefined}
          aria-hidden={open ? true : undefined}
          aria-label="Open Distranet member login"
        >
          <span className="portal-link-full">Member login</span>
          <span className="portal-link-short">Login</span>
          <b aria-hidden="true">↗</b>
        </Link>
        <button ref={toggleRef} className="menu-toggle" type="button" aria-label={open ? "Close site navigation" : "Open site navigation"} aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(v => !v)}>
          <span>{open ? "Close" : "Explore"}</span><i className={open ? "open" : ""}><b /><b /></i>
        </button>
      </div>
    </header>
    <div ref={menuRef} className={`site-menu ${open ? "open" : ""}`} id="site-menu" role="dialog" aria-modal={open ? "true" : undefined} aria-label="Site navigation" aria-hidden={!open}>
      <div className="menu-atmosphere" aria-hidden="true"><span /><span /><span /></div>
      <nav aria-label="Main navigation">
        {routes.map(([no, label, href]) => {
          const current = pathname === href;
          return <Link href={href} key={href} tabIndex={open ? 0 : -1} aria-current={current ? "page" : undefined} className={current ? "current" : ""}>
            <small>{no}</small><strong>{label}</strong><span>{current ? "Current chapter" : "Enter chapter"} <b>{current ? "•" : "↗"}</b></span>
          </Link>;
        })}
        <Link href="/member-access" className="mobile-member-access" tabIndex={open ? 0 : -1}>
          <small>07</small><strong>Member login</strong><span>Open member portal <b>↗</b></span>
        </Link>
      </nav>
      <div className="menu-footer"><p>Independent strength.<br />Connected.</p><span>Member-owned network<br />Fluid power distribution</span></div>
    </div>
  </>;
}
