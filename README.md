# ABC Tutoring — concept site

A static, mobile-friendly concept site: home page, subject overview, six
tutor profiles, a booking form, and a password-gated owner dashboard.
No build step — it's plain HTML/CSS/JS, so you can open `index.html`
directly or deploy it as-is.

## What's real vs. what's a concept demo

| Feature | Status |
|---|---|
| Page views, tutor-card views, booking submissions | **Real** — sent to your PostHog project (key already wired in) |
| Booking form saving a request & marking a slot "Booked" | **Concept demo** — saved to the visitor's browser (`localStorage`) only, not a shared database |
| Owner text/email when someone books | **Not implemented** — see "Making it real" below |
| Owner dashboard password | **Concept demo** — a client-side check anyone could bypass by reading the page source; fine for keeping casual visitors out, not real security |

Because bookings live in each visitor's own browser, two different parents
booking the same slot won't see each other's booking, and the owner
dashboard only shows activity from whichever device opens it. That's the
trade-off of a site with no backend — see below for how to remove it.

## Try it locally

```bash
cd abc-tutoring
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Try booking a slot, then open
`http://localhost:8000/analytics.html` (password: `abc-owner-2026`,
set near the top of `js/analytics.js`) to see it show up.

## Deploying to GitHub Pages

1. Push everything in this folder to your `<org-or-username>.github.io`
   repo (or any repo, with Pages enabled on it) — `index.html` at the root.
2. Settings → Pages → confirm it's serving from the branch/folder you pushed to.
3. Visit the published URL — no build step needed.

## Making it real (recommended next steps)

**Real booking storage + owner notifications.** Swap the `saveBooking()`
call in `js/app.js` for a request to a form backend — [Formspree](https://formspree.io)
or [EmailJS](https://www.emailjs.com) both work with a static site and will
email (Formspree can also text via a Zapier/Make step) you on every
submission, no server required. For real shared slot-locking across every
visitor, you'd want a small database behind that form (Airtable, Google
Sheets via Apps Script, or a lightweight backend) instead of `localStorage`.

**Real, all-visitor analytics.** The site already sends `tutor_card_viewed`
and `booking_submitted` events to your PostHog project on every visit, from
every visitor. In PostHog:
- **Most-viewed tutor:** New Insight → Trend → event `tutor_card_viewed`,
  broken down by the `tutor` property.
- **View-to-booking ratio:** A Funnel from `tutor_card_viewed` → `booking_submitted`.
- **"Heard about us" breakdown:** Trend on `booking_submitted`, broken down
  by the `heard_about` property.

Note that names and emails are deliberately *not* sent to PostHog (see
`track("booking_submitted", …)` in `js/app.js`) to keep that data out of a
third-party analytics tool — real bookings/contact info should live only in
your booking backend once you add one.

**Real owner login.** Replace the password check in `js/analytics.js` with
real authentication (even something simple like Netlify Identity or
Cloudflare Access in front of `analytics.html`) once this moves off a
personal device.

## Customizing

- **Tutors, rates, subjects, availability:** all in `js/data.js` — edit the
  `TUTORS` array. Six tutors are defined; add, remove, or edit freely.
- **Tutor photos:** each tutor currently shows a colored initials avatar
  (no stock photos were used). To add real headshots, drop images in a
  new `images/` folder and swap the `.tutor-avatar` div in `js/app.js`
  for an `<img>` tag.
- **Colors/fonts:** all defined as CSS variables at the top of `css/style.css`.
- **Owner password:** `OWNER_PASSWORD` at the top of `js/analytics.js`.
- **Copy:** all in `index.html` — headline, about section, subject blurbs.
