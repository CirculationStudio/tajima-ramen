// "Open until 10pm" / "Opens at 11:30am", per location, computed live.
//
// AN ENHANCEMENT, NEVER A REPLACEMENT. The static hours rows are server
// rendered from locations.json and stay exactly as they are. This adds one
// line beneath them. The element ships `hidden` with no text, so with
// JavaScript off a reader sees the published hours and nothing else, which is
// the correct degradation: a wrong live status is worse than no live status.
//
// NOT IN SCHEMA, AND THIS MATTERS. openingHoursSpecification is rendered on
// the server from the same `hours` array and is the canonical machine-readable
// answer. This is a convenience for a human reading the page. If the two ever
// disagreed, the graph would be the one that is right, which is exactly why
// this never writes to it and never touches a <script type="application/ld+json">.
//
// AMERICA/LOS_ANGELES, NOT THE VISITOR'S ZONE, for the same reason the theme
// clock uses it: whether a room is open is a fact about San Diego.
//
// KNOWN GAP, AND IT IS REAL: there is no special-hours data in this repo. On a
// holiday closure this will say a room is open. See DESIGN_SYSTEM.md open
// items; GBP holds the data.

const ZONE = "America/Los_Angeles";
const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

/**
 * The current weekday and minutes-since-midnight in the restaurant's zone.
 * Intl is the whole implementation: it already knows the DST rules, and any
 * offset arithmetic written here would be wrong twice a year.
 */
function nowInZone() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(new Date());

  const get = (t) => parts.find((p) => p.type === t)?.value;
  let hour = Number(get("hour"));
  if (hour === 24) hour = 0; // some engines format midnight as 24
  const minute = Number(get("minute"));
  const dayIndex = DAYS.indexOf(get("weekday"));
  if (dayIndex < 0 || Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { dayIndex, minutes: hour * 60 + minute };
}

/** "22:00" to 1320. Returns null on anything unexpected rather than guessing. */
function toMinutes(hhmm) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Every window for one weekday, as {open, close} in minutes, sorted.
 *
 * A rule whose close is at or before its open is treated as running past
 * midnight and is clamped to end of day. No room in locations.json does this
 * today (the latest close is 23:30) but a late window is exactly the kind of
 * thing that gets added later, and silently inverting it would report a room
 * closed all evening.
 */
function windowsFor(rules, dayIndex) {
  const day = DAYS[dayIndex];
  const out = [];
  for (const rule of rules) {
    if (!Array.isArray(rule.days) || !rule.days.includes(day)) continue;
    const open = toMinutes(rule.opens);
    const close = toMinutes(rule.closes);
    if (open === null || close === null) continue;
    out.push({ open, close: close > open ? close : 24 * 60 });
  }
  return out.sort((a, b) => a.open - b.open);
}

/**
 * Minutes since midnight to the way an American reads a closing time:
 * 1320 to "10pm", 690 to "11:30am".
 *
 * This is the SECOND implementation of this rule. The first is the clockTime
 * filter in eleventy.config.js, which formats the published hours row this
 * line sits directly under. They cannot share code (one runs in the build,
 * one in the browser) so they have to agree by hand: whole hours drop the
 * minutes, noon is 12pm, midnight is 12am. If you change one, change both.
 *
 * A window that runs to midnight is clamped to 24*60 upstream, and that
 * lands back on 12am here, which is the right thing to print.
 */
function clockTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * The status for a set of rules at a moment, or null if it cannot be computed.
 * Returns the label text and whether the room is open, so the caller decides
 * how to present it.
 */
export function statusFor(rules, now) {
  if (!Array.isArray(rules) || !rules.length || !now) return null;

  const today = windowsFor(rules, now.dayIndex);
  for (const w of today) {
    if (now.minutes >= w.open && now.minutes < w.close) {
      return { open: true, label: `Open until ${clockTime(w.close)}` };
    }
  }

  // Not open. The next opening is either later today or on a following day.
  const later = today.find((w) => w.open > now.minutes);
  if (later) return { open: false, label: `Opens at ${clockTime(later.open)}` };

  for (let step = 1; step <= 7; step += 1) {
    const next = windowsFor(rules, (now.dayIndex + step) % 7);
    if (next.length) return { open: false, label: `Opens at ${clockTime(next[0].open)}` };
  }
  return null;
}

// Guarded so the pure functions above can be imported and tested in node,
// where there is no document. In the browser this runs on import as usual.
if (typeof document !== "undefined") {
for (const el of document.querySelectorAll("[data-hours-status]")) {
  let rules;
  try {
    rules = JSON.parse(el.dataset.hours || "[]");
  } catch (e) {
    continue; // leave it hidden rather than showing a broken status
  }
  const status = statusFor(rules, nowInZone());
  if (!status) continue;
  el.textContent = status.label;
  el.dataset.open = status.open ? "true" : "false";
  el.hidden = false;
}
}
