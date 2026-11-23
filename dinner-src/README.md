# Guest drinks page (AI Leaders Dinner, Wonderful Indonesia)

Static page for voice drink ordering, served at https://diditdwianto.github.io/dinner/.
Adapted from the Wonderful Thailand page (github.com/chaipat-s/dinner): Indonesian and English instead of Thai and English,
and connected to the Indonesia Demo tenant.

## How it works
- The waiter App (`drinks-orders`, workspace "ID - AI Leaders Drink Order") makes each guest's link:
  `https://diditdwianto.github.io/dinner/?g=<attendee_id>&n=<display name>`.
- The page shows the name, then one tap starts a browser voice call with the agent **Dinner Drinks Host**
  through `@wonderful/web`, using the publishable Embedded Chat SDK key in `config.json`.
  It sends session metadata `{guest, name, seat, lang}`; the agent looks the guest up in `dd_attendees`.
- `?s=<seat>` (1–20): old-style seat links. No params: walk-in, the agent asks for the name.
- `&mode=hold` / `&mode=free` overrides the talk mode; otherwise it comes from the App's Settings
  (public Function `dd-talk`), with `src/mode.json` as the fallback. `&lang=id|en` overrides the phone language (tests).
- The page ends the call by itself after the agent's "Pesanan sudah terkirim" / "Done, your order is in" line, or its
  "Mohon maaf, untuk saat ini" / "Sorry, for now please ask your waiter" line (agent `lib/drinks.ts` LINES).

## Config (`config.json`)
`agent_id`, `key` (Agent Studio → Dinner Drinks Host → Channels → Embedded Chat; publishable, safe in browser code)
and `base_url`. The site origin `https://diditdwianto.github.io` must be in Embedded Chat's allowed domains.

## Build
Output goes to `../dinner/`. `@wonderful/web` 0.3.30 comes from the Indonesia Demo package registry
(`https://indonesia.api.demo.wonderful.ai/api/npm/`, needs a registry token in `.npmrc`; never commit it).
- With Node: `npm install && npm run build`.
- Without Node: unpack the `@wonderful/web` tarball into `node_modules/@wonderful/web`, then
  `ESBUILD=/path/to/esbuild ./build.sh`.
