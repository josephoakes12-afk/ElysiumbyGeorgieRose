# Content Updates Guide

## Update Google reviews (recommended monthly)

1. Open the Google profile share link:
   `https://share.google/EBIZEN8UOwQqzRysz`
2. Copy review text exactly as written.
3. Open `assets/testimonials.json`.
4. Replace placeholder entries (`[PASTE REAL GOOGLE REVIEW HERE]`) with real review text.
5. Keep each entry in this format:

```json
{
  "name": "A.",
  "rating": 5,
  "date": "2026-01-18",
  "source": "Google",
  "text": "Review text here",
  "service": "Nails"
}
```

## Important review rules

- Keep names anonymised to first name or initials only (`A.`, `S.`, `M.`).
- Do not include phone numbers, addresses, or sensitive health/personal details.
- Keep wording as close to the original review as possible.
- Minor trimming for length is fine.
- Use service tags exactly as:
  - `Nails`
  - `Permanent Jewellery`
  - `Both`
  - `""` (if unknown)

## Update social links and embeds

1. Open `assets/site-config.js`.
2. Update:
   - `social.instagramUrl`
   - `social.facebookUrl`
   - `social.tiktokUrl` (optional)
3. For homepage embedded posts, update:
   - `social.instagramEmbedPosts` with 1-3 Instagram post URLs.

If embed posts are missing or blocked, the site automatically shows a fallback image grid.

## Update contact and booking values

In `assets/site-config.js`:

- `bookingUrl`: set your external booking page URL (or leave blank to use contact page).
- `contactEmail`: primary contact email.
- `contactPhone`: optional.
- `locationText`: short service-area text shown in the footer and contact page.
- `formspreeEndpoint`: your live Formspree endpoint.

## Image updates

- Nails images: `assets/images/Nails/`
- Jewellery images: `assets/images/Jewellery/`
- Do not use `.heic` files in page markup.
- Keep filenames URL-safe when used in HTML (`space => %20`, `& => %26`).
