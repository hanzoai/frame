"use client";

// A film, playing full-bleed, as the top of a page.
//
// The film IS the hero. There is no headline beside it, no pill above it and
// no subline under it: the film says the whole thing itself, in the product's
// own chrome, copy and typefaces, and anything repeating that in HTML would
// only be saying it twice.
//
// It fills the fold edge to edge. `object-fit: cover` crops it to whatever
// shape the screen is, so the master must be the RIGHT shape to begin with:
// a phone is 0.46 wide-to-tall and a laptop is 1.6, and one master cannot be
// both — covering a 390x844 phone with a 16:9 master shows the middle QUARTER
// of it. So there are two, each composed for its own frame, and the page picks
// by ORIENTATION rather than by width: a 768x1024 tablet is portrait, and
// handing it the wide master would crop 555px off each side.
//
// It does NOT loop. The film ends on the finished product and stays there, so
// the last thing on screen is the thing itself, running.
//
// THE STILL IS WHAT THE SERVER SENDS, and <picture> picks which still without
// a line of JavaScript: motion gets frame 0 — the same picture the film opens
// on, so when the player takes over the swap is invisible — and reduced motion
// gets the FINAL frame instead, the finished product, because that viewer never
// sees the film and the payoff is the one image worth having. Each viewer
// downloads exactly one of the four, and no <video> is ever created for the
// reduced-motion path: a paused player still fetches the megabytes.
//
// Nothing here declares an aspect ratio, and nothing needs to: the box is the
// fold. It is the right size before a byte of media arrives.
//
// Six files, one `src`. The names are the contract — see `assets()`. A page
// that has rendered its masters says `<Frame src="/hero" alt="…" />` and is
// done; there is no other knob, because there is no second way to hang a film
// at the top of a page.

import { useEffect, useState } from "react";

/** The six files a `src` names. `/hero` -> `/hero-wide.mp4`, `/hero-wide-first.jpg`, … */
const assets = (src: string, shape: "wide" | "tall") => ({
  film: `${src}-${shape}.mp4`,
  first: `${src}-${shape}-first.jpg`,
  last: `${src}-${shape}-last.jpg`,
});

const PORTRAIT = "(orientation: portrait)";
const REDUCE = "(prefers-reduced-motion: reduce)";

// The <img> lives inside <picture>, which lays out nothing and is not
// positioned — so the image anchors to the fold box, same as the video.
const COVER = {
  position: "absolute",
  inset: 0,
  width: "100%",
  maxWidth: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
} as const;

// Black, because the films are true black: any sliver the cover crop leaves is
// the film's own background rather than a seam.
const FOLD = {
  position: "relative",
  width: "100%",
  minHeight: "100svh",
  background: "#000",
  overflow: "hidden",
} as const;

export type FrameProps = {
  /**
   * Shared prefix of the six rendered files, e.g. `/hero` for
   * `/hero-wide.mp4` + `/hero-wide-first.jpg` + `/hero-wide-last.jpg` and the
   * three `-tall` siblings. Absolute, from the site root.
   */
  src: string;
  /**
   * What the film says, for anyone who cannot watch it — and for anything
   * reading the page rather than watching it. Carry the message here; it is
   * the only place the words live.
   */
  alt: string;
};

export default function Frame({ src, alt }: FrameProps) {
  const wide = assets(src, "wide");
  const tall = assets(src, "tall");
  const [film, setFilm] = useState<ReturnType<typeof assets> | null>(null);

  useEffect(() => {
    const motion = window.matchMedia?.(REDUCE);
    const portrait = window.matchMedia?.(PORTRAIT);
    // No player at all when motion is unwelcome — the still already answered.
    if (!portrait || motion?.matches) return;
    const pick = () => setFilm(portrait.matches ? tall : wide);
    pick();
    // A phone that turns sideways is a different frame, and the master it was
    // handed is now the wrong shape for it.
    portrait.addEventListener("change", pick);
    return () => portrait.removeEventListener("change", pick);
    // `src` is the whole input; the two asset sets are derived from it.
  }, [src]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={FOLD}>
      {film ? (
        <video
          style={COVER}
          src={film.film}
          poster={film.first}
          aria-label={alt}
          autoPlay
          muted
          playsInline
          preload="auto"
        />
      ) : (
        <picture>
          <source media={`${REDUCE} and ${PORTRAIT}`} srcSet={tall.last} />
          <source media={REDUCE} srcSet={wide.last} />
          <source media={PORTRAIT} srcSet={tall.first} />
          <img style={COVER} src={wide.first} alt={alt} fetchPriority="high" />
        </picture>
      )}
    </div>
  );
}
