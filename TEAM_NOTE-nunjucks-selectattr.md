# Team note: `selectattr` silently returns everything in Nunjucks

**Written:** 2026-08-03
**Found on:** Tajima Ramen build
**Applies to:** every Circulation Studio Eleventy project using Nunjucks templates
**Severity:** silent wrong output, no error, no warning, no build failure

This is not a Tajima bug. It is a stack-level trap and it is worth ten minutes
of everyone's time to check for it.

---

## The short version

In Nunjucks, this does **not** do what it looks like it does:

```njk
{% set ramen = menu.items | selectattr("section", "equalto", "ramen") %}
```

It does not filter by `section == "ramen"`. It returns **every item whose
`section` property is truthy**, which on a well-formed data file is all of them.
The `"ramen"` argument is ignored entirely.

There is no error. The page builds. The template looks correct. The output is
wrong.

## Why it happens

`selectattr` is a Jinja2 filter. Nunjucks added its own `selectattr` in 3.2.0,
but the second argument has to be the name of a **registered test**, and
Nunjucks does not ship Jinja2's `equalto` test. When the named test cannot be
resolved, the one-argument form takes over: "keep every item where this
attribute is truthy."

So the failure mode is not "throws" or "returns empty." It is "returns
everything," which is the one result that looks plausible on a page and
survives a quick eyeball.

## What it actually did on this build

Two places, both shipped green:

- **`/menu/`** rendered all twelve dishes under *each* of Ramen, Izakaya, and
  Dessert. Matcha Panna Cotta appeared in the ramen bento. Thirty-six dish
  cards instead of twelve.
- **`/locations/`** rendered fourteen location cards instead of seven. The San
  Diego section and the "Beyond San Diego" section each rendered the full list,
  so Convoy appeared twice and Maui was filed under San Diego.

Caught by counting `<article>` elements in the built HTML, not by looking at
the page. On a dark, image-heavy design, "too many cards in a scrolling grid"
does not announce itself.

**Worth sitting with:** on a restaurant site, this class of bug puts a dish on
a menu section it does not belong to, and it puts a location in a region it is
not in. Both are exactly the kind of thing that ends up in structured data and
then in an AI answer. If the schema had been generated from the template
instead of from the source data, the wrong grouping would have shipped to
Google too.

## The fix

Register an explicit filter. In `eleventy.config.js`:

```js
// Filter a list of objects by an exact property value.
//
// Nunjucks' own `selectattr(key, "equalto", value)` does NOT do this: the
// `equalto` test is not resolved, so it silently degrades to a truthiness
// check on the attribute and returns every item whose key is set.
eleventyConfig.addFilter("where", (items, key, value) =>
  (items || []).filter((item) => item && item[key] === value),
);
```

Then:

```njk
{% set ramen = menu.items | where("section", "ramen") %}
```

Ten lines, no dependency, and it fails loudly if the data shape is wrong
instead of quietly if the filter name is.

## What to check in your project

Grep is enough:

```bash
grep -rn "selectattr\|rejectattr" --include=*.njk --include=*.html src/
```

Any hit using a test name (`equalto`, `eq`, `ne`, `sameas`, `in`) is suspect.
The bare one-argument form, `selectattr("published")`, is fine and does what it
says.

If you find hits, **do not just read the template.** Count the output:

```bash
# expected vs actual, per section
grep -c '<article' _site/some-page/index.html
```

## The wider lesson, and the reason this is a separate note

Jinja2 and Nunjucks look interchangeable and are not. Nunjucks implements a
subset, and the gaps do not always announce themselves: some are syntax errors
(loud, fine), and some are semantic no-ops (quiet, expensive). `selectattr` is
the second kind.

Two habits that would have caught this earlier, and that are worth adopting
generally:

1. **Generate structured data from the source data, not from the rendered
   template.** On this build the JSON-LD was built in `_data/schema.js` off
   `menu.json` directly, so the schema stayed correct while the page was wrong.
   That is what made the mismatch findable. It is also why the wrong grouping
   never reached the schema.
2. **Verify built output by counting, not by reading.** "Does the ramen section
   contain exactly eight articles" is a five-second check that catches a whole
   class of filter and loop bugs that reading the template cannot.

Questions to Steve.
