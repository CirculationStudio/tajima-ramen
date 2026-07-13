# Claude Instructions

**Project:** Tajima Ramen
**Last updated:** 2026-07-13
**For:** Claude Code and Chad (autonomous agent)

## Purpose

This file contains the rules, standards, and brand constraints that all AI agents must follow when working on this project. This ensures consistency, maintains brand integrity, and prevents generic/machine-generated aesthetics.

## Hard Rules (Never Break These)

### Universal constraints

- **NO em dashes anywhere** (use commas, periods, parentheses)
- **NO banned filler phrases:**
  - "Unlock your potential"
  - "Leverage our expertise"
  - "Cutting-edge solutions"
  - "Seamless experience"
  - "Game-changing"
  - [Add brand-specific banned phrases from DESIGN_SYSTEM.md during Phase 3]
- **NO unauthorized changes** to client-supplied copy without approval
- **NO AI-generated imagery** posing as real photography where authenticity is claimed
- **NO accessibility overlays** (they raise legal risk, not lower it)

### Code and development standards

- Always reference ARCHITECTURE.md for technical decisions
- Follow the file structure defined in the repo root
- Use semantic HTML for agent-readability
- Build for editability: separate content from layout using clean `_data` files
- Never hardcode markup that a component covers
- Accessibility is built in from the start (WCAG 2.1 AA minimum)
- Commits are surgical: never `git add -A`
- URLs: lowercase, hyphenated, no accents in slugs

### Brand constraints (from DESIGN_SYSTEM.md)

[This section will be populated during Phase 3 after DESIGN_SYSTEM.md is completed. It mirrors the Forbidden Patterns section.]

#### Typography

- **Approved fonts:** [To be defined in DESIGN_SYSTEM.md]
- **BANNED:** Inter font or other generic defaults

#### Colors

- **Approved palette:** [To be defined in DESIGN_SYSTEM.md]
- **BANNED:** Generic purple-to-blue AI gradients, default indigo/blue

#### Iconography

- **Approved icon system:** [To be defined in DESIGN_SYSTEM.md]
- **BANNED:** Unmodified stock icons, default Lucide icons without customization

#### Voice (if agency-AI provenance)

[Reference voice-tone.md for detailed brand voice]

## Component Usage

[Document reusable components and their correct usage patterns after Phase 5]

### Heroes
[Guidelines]

### Cards
[Guidelines]

### Forms
[Guidelines]

### CTAs
[Guidelines]

## Content Guidelines

### If content provenance = client-supplied

- DO NOT rewrite client copy without explicit approval
- Editorial pass for obvious errors only, with changes confirmed back to client

### If content provenance = agency-AI

- Follow voice-tone.md for all copy generation
- Never invent claims, credentials, or facts that cannot be verified
- All generated copy must be reviewed before deployment

### All provenance types

- Legal, pricing, and claims content NEVER auto-generated or auto-edited
- Schema/structured data must match visible content exactly
- Alt text on every meaningful image, empty alt on decorative images

## SEO and Structured Data

- Title tag and meta description must be unique per page, keyword-aligned from SITE_ARCHITECTURE.md
- Implement JSON-LD schema exactly as specified in SCHEMA.md
- Validate all schema blocks at validator.schema.org
- FAQPage schema must match visible FAQ exactly (business-critical for AI answers)
- Schema must not regress (it's how clients get found in AI answers)

## Performance Standards

### Core Web Vitals targets (75th percentile)

- **LCP:** < 2.5s
- **INP:** < 200ms
- **CLS:** < 0.1

### Asset optimization

- Hero images: `loading="eager"` + `fetchpriority="high"` + preload
- Below-fold images: `loading="lazy"`
- All images: explicit width/height attributes (prevents layout shift)
- Target < 300KB per image
- Serve WebP/AVIF with fallback

### JavaScript discipline

- Keep scripts minimal
- Defer or async everything non-critical
- No long main-thread tasks
- No `transition: all` (causes INP issues)

## Build Workflow

1. Read all relevant documentation before making changes:
   - ARCHITECTURE.md for technical structure
   - DESIGN_SYSTEM.md for brand constraints
   - SITE_ARCHITECTURE.md for content strategy
   - SCHEMA.md for structured data requirements
   - voice-tone.md for copy guidelines (if applicable)

2. Make changes following all constraints above

3. Verify accessibility, performance, and brand compliance

4. Test build: `npm run build`

5. Check preview deployment before considering complete

## What Claude Code and Chad Should NOT Do

- Never generate or modify legal disclaimers, privacy policies, or terms without explicit instruction
- Never modify pricing information without verification
- Never claim credentials, certifications, or expertise not verified by client
- Never use stock photography where real/authentic imagery is required
- Never skip accessibility requirements to move faster
- Never compromise performance targets for visual effects

## What Claude Code and Chad SHOULD Do

- Proactively flag potential accessibility issues
- Suggest performance improvements when noticed
- Point out inconsistencies with DESIGN_SYSTEM.md constraints
- Recommend structured data opportunities aligned with SCHEMA.md
- Ensure all work is agent-readable (semantic HTML, clean structure)
- Build with the assumption that both humans and AI agents will consume the content

## References

- See `.claude/README.md` for how different agents should use this file
- See `.claude/AUDIT_AGENT.md` for the quarterly audit checklist
- See all root-level .md files for detailed specifications

---

**Remember:** This site is built to be distinctive, accessible, performant, and agent-readable. Every choice should serve those goals.
