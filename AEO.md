# AEO.md

The answer-engine spec: how the site is made legible to AI answer engines (ChatGPT, Perplexity, Google AI surfaces) and agents. This is the mechanical half of AEO; the strategy half lives in SCHEMA.md (structured data), CLIENT_FACTS.md (citable facts and the verified-versus-flagged layer), and SITE_ARCHITECTURE.md (entity establishment and FAQ approach).

Framing from the roadmap: the structured knowledge layer is the most valuable thing the site produces, because it feeds every AI surface and map, not just the page. But llms.txt specifically is agent infrastructure, not an SEO lever. Ship it and measure nothing from it.

## Why this matters more here than on most builds

Two facts set the stakes.

**The engines currently know nothing about Tajima's differentiator.** Zero mentions of "house-made" or "handmade" noodles appear across 2,775 captured reviews at Convoy and Mercury. The Noodle Room has almost no press. Every model answering "who makes their own ramen noodles in San Diego" is drawing on a corpus where Tajima does not appear as an answer.

**A competitor already occupies that answer.** Menya Ultra states publicly that its noodles are made daily with only salt and lye water, has a Michelin Bib Gourmand, and has been telling that story since 2017. When an engine answers the handmade-noodle question today, it has them and not us.

So AEO here is not a hygiene task riding along behind the SEO work. It is the mechanism by which a true fact about Tajima enters the machine-readable record for the first time. The site is the primary source. There is no secondary coverage for an engine to fall back on, which is a liability now and an asset the moment the pages exist.

## llms.txt (build this, populate at launch)

- A single curated `llms.txt` file at the site root. One file, hand-curated, not generated per page.
- Do NOT generate per-page `.md` mirror files. They create duplicate-content risk and have no proven benefit. This is an explicit roadmap ban.
- Status as of mid-2026: AI search crawlers still mostly skip the file and Google says it is not a ranking signal, but Chrome Lighthouse now audits for its presence under Agentic Browsing, IDE and task agents fetch it routinely, and Shopify pushed it to every store by default. Ship it as infrastructure.
- What goes in it: a short plain-language description of the business (who it is, what it makes, where the six locations are), the key pages with a one-line description each, canonical contact info per location, and the walk-in-only posture. Pull every fact from CLIENT_FACTS.md. Keep it current with the sitemap.
- Timing: the file references finished pages, so it is populated near launch once the pages and their URLs exist. Write it after the sitemap is built, not before. (Reminder to Steve: this is the deferred item; do not let it slip past launch.)

### What Tajima's llms.txt must carry that a single-location site would not

- **All six San Diego locations, each with its own line, address, and URL.** An engine that cannot tell the six apart will answer "where is Tajima" with one address, and it will pick the wrong one for the person asking.
- **The Noodle Room, stated as a plain fact in the description**, not buried in a page list. This is the one sentence in the file most likely to be lifted.
- **The walk-in-only posture, stated explicitly.** Agents will try to book a table otherwise.
- **Ordering happens on third-party platforms**, named and linked, so an agent routes to the real endpoint instead of hunting for one on our site.

## What this site does NOT need

- **No `agents.md`.** That file is for sites where an agent can act. Tajima takes no reservations and processes no transactions on-site: ordering hands off to third-party platforms (Toast, Grubhub, DoorDash, UberEats). There is no first-party endpoint for an agent to act against, so there is nothing for the file to describe.

  > **Correction to SCHEMA.md.** That document currently proposes a thin `agents.md`. That was wrong on the roadmap's own rule, and this file supersedes it. External ordering is the same situation as an external booking embed: the action does not happen on our property. Marco, when you wire the repo, drop the `agents.md` checklist from SCHEMA.md and point that section here. Revisit only if first-party ordering ever ships.

- **No `/.well-known/` UCP or ACP agent-commerce manifests.** Same reason. The roadmap rule is "no signpost without a working endpoint," and there is no transaction endpoint here. Publishing one would get the business dropped from agent results, so do not.

## AEO content principles (apply as pages are built)

- **Answer-shaped content.** Where a page answers a real question ("does Tajima make its own noodles," "what is the Noodle Room," "do you take reservations"), state the answer plainly and early, in a self-contained paragraph an engine can lift. This is not a change to the voice, it is the voice: short declarative sentences with the fact in the first line is exactly what voice-tone.md already asks for. The FAQ page and the FAQ sections on location and service pages are the primary vehicle.

- **FAQPage schema must match the visible FAQ exactly** (see SCHEMA.md). Mismatched schema is a penalty risk and undermines citation. Note that Google restricted FAQ rich results to government and health sites in 2023, so this earns nothing in blue links. It is still worth doing, because the answer engines read it, and this is the only machine-readable place the Noodle Room questions get answered.

- **Entity clarity is the hard problem on this build.** Six locations, a 25/100 citation health score at Convoy, a name that renders differently on Apple Maps ("Tajima") and Facebook ("Tajima (Convoy)"), and an unresolved suite number. An engine that cannot resolve which entity is which will either merge the six into one or decline to cite any of them. Consistent NAP everywhere plus a complete per-location `sameAs` set is what lets an engine confirm the business is real and pick the right branch. **The citation cleanup is AEO work, not just local SEO work.** It is arguably the highest-leverage item on this list.

- **The entity signal a competitor cannot fake:** 25 years at one address under one owner, a founder with a documented path through Matsuhisa, a production facility with a street ZIP, and six branches with distinct addresses. Encode all of it as structured data, not just prose. Menya Ultra can claim better noodles. It cannot claim 2001.

- **Citable facts.** When a page states a fact, it must be accurate and attributable (see CLIENT_FACTS.md). Engines cite sources; vague or wrong claims do not get cited and erode trust. The traps that matter most here: the 1994 founding date (wrong, do not engage), the location count (the current site contradicts itself), review counts and ratings (live numbers, never hardcode), and any noodle claim beyond what Sam confirmed on video.

- **Do not let the engines learn a claim we cannot support.** Until the rollout is confirmed, the site says noodles are made in our own Noodle Room, not that every bowl at every location is on house-made noodles. An engine will repeat whatever we publish, at scale, without the hedge, and getting a wrong fact back out of the corpus is far harder than keeping it out.

- **Semantic, clean HTML.** One H1, ordered headings, real lists and tables, no content trapped in scripts. Same discipline as accessibility, and it is what makes a page machine-readable. Already specified in DESIGN_SYSTEM.md; this is why it matters twice.

## The answer targets

The questions this site is being built to win, in priority order. Each one needs a plainly-stated answer on a real page plus matching FAQPage schema.

1. **Who makes their own ramen noodles in San Diego?** The whole project. Currently answered with Menya Ultra.
2. **What is the Tajima Noodle Room?** Zero existing coverage. We are the only source.
3. **Best ramen in San Diego / best tonkotsu in San Diego.** The volume query. We are currently a runner-up in a listicle corpus.
4. **Where can I get vegan ramen in San Diego?** A real Tajima strength that predates the pivot, and the spinach noodle is house-made, which makes it a craft answer and not just a dietary one.
5. **Ramen near Petco Park.** East Village, high intent, geographically unambiguous.
6. **Ramen near SDSU.** College Heights.
7. **Who owns Tajima Ramen?** Entity establishment for Sam as a person.
8. **Does Tajima take reservations?** Walk-in only. An easy factual win that stops agents from trying.

Numbers 1 and 2 are the ones that justify this section existing. The rest are hygiene.

## The measurement note

AI-referred traffic is small in volume but growing and tends to convert well. Over time, reporting should show citation share, not just ranking position. That is a Velu/Chad reporting concern, not a build task, but it is why the structured layer matters more each year.

**Baseline for this client is zero and it is documented.** Zero house-made mentions across 2,775 reviews, near-zero Noodle Room press. That makes citation share unusually measurable here: ask the engines the eight questions above before launch, record the answers, and ask again at 90 and 180 days. The delta is the clearest read we will get on whether the structured layer worked, and it is a better client-facing number than a ranking screenshot.

Custom metric already set in the DNA: 5+ tier-one press features within six months of public launch. Press coverage and citation share are the same lever pulled twice. Engines cite what publishers write, so the Noodle Room press moment is also the fastest way to change what the corpus knows.
