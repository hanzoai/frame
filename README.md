# @hanzo/frame

The film at the top of the page.

```tsx
import Frame from "@hanzo/frame";

<Frame src="/hero" alt="What the film says, in one sentence." />;
```

That is the whole API. Two props, no options.

## What it does

A hero film is not a `<video>` tag. It is a set of decisions that every surface
would otherwise make again, differently:

- **Full bleed.** `100svh`, `object-fit: cover`, true black behind it.
- **Two masters, picked by orientation.** A phone is 0.46 wide-to-tall and a
  laptop is 1.6. Covering a 390×844 phone with a 16:9 master shows the middle
  quarter of it. So there are two — `1080×1920` and `1920×1080` — and the pick
  is by orientation, not width: a 768×1024 tablet is portrait, and the wide
  master would lose 555px off each side. Turning the phone re-picks.
- **The still is what the server sends.** A `<picture>` with media queries
  chooses it — no JavaScript, correct in SSR, right on the first paint.
- **Reduced motion gets the ending.** That viewer never sees the film, so they
  get the *final* frame — the finished product — and no `<video>` is created at
  all. A paused player still downloads the megabytes.
- **No loop.** The film ends on the product and stays there.
- **The words live in `alt`.** Nothing is layered over the film, so `alt` is
  the message, for readers and for machines.

Motion viewers get frame 0 as the poster — the same picture the film opens on,
so the swap to the player is invisible. Every viewer downloads exactly one of
the four stills.

## The six files

`src` is their shared prefix. `src="/hero"` means:

| File | What |
|---|---|
| `/hero-wide.mp4` | 1920×1080 master |
| `/hero-wide-first.jpg` | its frame 0 — the motion poster |
| `/hero-wide-last.jpg` | its final frame — the reduced-motion still |
| `/hero-tall.mp4` | 1080×1920 master |
| `/hero-tall-first.jpg` | its frame 0 |
| `/hero-tall-last.jpg` | its final frame |

Drop them in the app's `public/`. The names are the contract; there is no
mapping to configure.

## Rendering the masters

Films are rendered locally, in headless Chrome, by
[Hanzo Frames](https://github.com/hanzoai/frames) — no keys, no credits, no
service. That repo is the render half; this package is the display half. See
its skills for composing a scene.

House rules for a product film:

- Film the **real product**. Real chrome, real copy, real numbers. Never invent
  a feature, a metric or a screen.
- **Geist Sans** and **Geist Mono** are the only two faces on a Hanzo surface
  (`@hanzo/design`). Monochrome, near-black `#0a0a0a` page on true black.
- Calm pacing, gentle motion. Nothing swoops.
- **End on the running product.** Never on a URL, a wordmark or a call to
  action — the visitor is already there.

## Adding one to a page

1. Render the two masters and extract the four stills.
2. Put all six in `public/` under one prefix.
3. `<Frame src="/that-prefix" alt="…" />`.

There is no step four, and no per-page component. A page that needs a film
needs assets, not code.
