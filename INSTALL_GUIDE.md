# Installing GrowingSeeds on Android and iPhone

GrowingSeeds is now a real installable app (a **Progressive Web App**, or PWA): once it's hosted somewhere on the web, both Android and iPhone users can add it to their home screen with its own icon, and it opens full-screen with no browser bar — just like an app from a store.

## Package layout (read this first — it changed from earlier builds)

This package now ships as a small **website** with the actual app one level down, so that a plain link to your domain shows visiting parents a marketing/landing page first, not the app itself:

```
index.html              ← the GrowingSeeds landing page (this is your site's front door)
.well-known/             ← must stay exactly here, at the true root — do not move it
app/
  index.html             ← the actual GrowingSeeds app (PWA)
  manifest.json, sw.js, icons/, assets/
  install/
    android.html, ios.html, index.html
```

Upload the whole package **keeping this exact folder structure** — `app/` must stay a subfolder of the same place `index.html` (the landing page) and `.well-known/` live. Nothing inside `app/` needs to be touched; every link inside this package already points to the right place as long as the folders stay nested this way.

## Play only works after installing — this is intentional

Opening `app/index.html` in an ordinary browser tab (Chrome, Safari, etc., not launched from a home-screen icon) now shows an "Install GrowingSeeds to Play" screen instead of the game, with buttons straight to the Android/iPhone install steps. This is deliberate: GrowingSeeds is meant to be a home-screen app, not something played from a browser tab. Once installed and opened from its home-screen icon, the same screen goes straight to the game as normal — nothing else about the app changes. The landing page (this site's root) and the `install/` pages themselves are never gated, so the install flow itself is always reachable.

## Why it can't just be opened from the zip file

This is the one honest limitation to understand up front: **installation only works when the app is served over a real `https://` web address.** Opening `app/index.html` straight from a downloaded folder (a `file://` link) will still run the app perfectly, exactly as before — but neither Android nor iPhone will offer the "install"/"Add to Home Screen" behavior for a file opened this way, and animal-sound playback also requires a real `http(s)://` address (browsers block a `file://` page from loading its own sibling files). That's not a limitation of this build; it's a security rule built into every browser.

The good news: getting a real web address costs nothing and takes about 5 minutes, with no coding required.

## Step 1: Host the files (pick one, both are free)

### Option A — GitHub Pages (recommended if you already have a GitHub account)
1. Create a new repository on [github.com](https://github.com), and upload **every file and folder** from this package — `index.html`, `.well-known/`, and the whole `app/` folder — keeping the exact structure shown above.
2. In the repository's **Settings → Pages**, set the source to your main branch, root folder.
3. GitHub gives you a URL like `https://yourname.github.io/growingseeds/` — that's your landing page link to share. The app itself lives at `https://yourname.github.io/growingseeds/app/`.

### Option B — Netlify Drop (no account required)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the whole unzipped folder (with `index.html`, `.well-known/`, and `app/` all kept together at the same level) onto the page.
3. Netlify gives you a live `https://` link immediately — the root shows the landing page, `/app/` shows the game.

Either option works the same way from here — Supabase (the database) already talks to `https://`, so nothing else needs to change.

## Step 2: Install on Android (Chrome)

1. From the landing page, tap **"Install on Android"** (or open `app/index.html` directly in Chrome).
2. Tap the **⋮** menu in the top right.
3. Tap **"Add to Home screen"** (or **"Install app"** if Chrome shows it automatically as a banner).
4. Confirm — the GrowingSeeds icon now appears on the home screen and launches full-screen, no browser bar.

## Step 3: Install on iPhone (Safari)

iPhone requires **Safari** specifically — Chrome or other browsers on iOS cannot install home-screen apps.

1. From the landing page, tap **"Install on iPhone"** (or open `app/index.html` directly in Safari).
2. Tap the **Share** icon (square with an arrow pointing up) in the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **"Add"** in the top right — the GrowingSeeds icon now appears on the home screen and launches full-screen.

## Shareable install links (recommended way to hand this to a parent)

Once hosted (Step 1 above), the landing page's install buttons already point to three ready-made pages under `app/install/` that give a clean link to text/email/AirDrop instead of explaining the steps yourself:

- **`app/install/android.html`** — for Android. The moment they tap the big **Install Now** button, Chrome's real native "Install app?" dialog pops up immediately (that's a genuine one-tap install, not a redirect to a menu).
- **`app/install/ios.html`** — for iPhone/iPad. Apple does not allow any website or app to trigger installation with a single tap — this is a hard platform rule with no workaround, not a limitation of this build. This page instead gives a large, animated, unmissable 3-step "Add to Home Screen" walkthrough, and detects and warns if they're not in Safari (Add to Home Screen only works from Safari on iOS, never Chrome/Firefox on iPhone).
- **`app/install/index.html`** — a single link that auto-detects the visitor's device and redirects to whichever of the two pages above is correct. Use this one if you want to send *one* link to a mixed group (e.g. a family chat) rather than picking per-recipient. The landing page's own "Install" footer link already points here.

You generally don't need to link to these directly — the landing page at your root URL already does it for you.

## What the child/parent gets after installing

- Its own icon (a green sprout on a warm cream background) on the home screen, matching the app's branding.
- Full-screen launch with no browser address bar.
- The app shell (the game itself) still opens even with no internet connection, since it's now cached on the device the first time it's opened online. Animal sounds, Supabase login/sync, and anything else that genuinely needs the network will still need it, exactly as before.

## If you want a real app-store app later (.apk / .ipa)

If your app is already hosted (e.g. GitHub Pages) and installable per Steps 2–3 above, you already have the simplest kind of "installer" there is: the link itself. No extra build step is needed for a parent to add it to their home screen and use it like an app.

If instead you specifically want a distributable installer file — an `.apk`/`.aab` for the Play Store, or an `.ipa` for the App Store — that's a different, heavier path, because it requires each platform's own official build tooling, not something this environment (or any plain web host) can produce on its own:

**Android (.apk / .aab) — achievable without owning a Mac.** This sandbox's network can't reach pwabuilder.com to generate the file directly (its own outbound access is locked to package registries, the same restriction noted for narration-audio sourcing earlier in this project), so this is a walkthrough for you to run yourself — it's a genuinely mechanical 10-minute process, not a build task:

1. Host the app first (Step 1 above) if you haven't already — PWABuilder needs a real live `https://` URL to analyze, it can't work from the zip file alone.
2. Go to [www.pwabuilder.com](https://www.pwabuilder.com) and paste in your hosted app URL — point it at `app/index.html` specifically (e.g. `https://yourname.github.io/growingseeds/app/index.html`), since that's the manifest's declared `start_url`. Do **not** point it at the landing page root — that's just marketing HTML with no manifest.
3. PWABuilder scores your PWA. This app's manifest already has everything it checks for — `name`, `short_name`, `start_url`, `display: standalone`, `background_color`/`theme_color`, and all 4 required icon sizes (192/512, plus maskable 192/512) — so this should come back green with no fixes needed.
4. Click **"Package for Store" → Android**. Suggested settings:
   - **Package ID**: reverse-domain style, e.g. `id.fluxoryid.growingseeds` (must be unique to your app; PWABuilder won't let you reuse someone else's).
   - **App name** / **Launcher name**: `GrowingSeeds` (matches the manifest already).
   - **Display mode**: leave as `standalone` (matches the manifest).
   - Leave signing key generation on its defaults — PWABuilder auto-generates one and lets you download it. **Save that download somewhere safe** — you need the exact same signing key for every future update to this app; losing it means you can never update an already-installed/published version again.
5. Download the generated `.apk` (for direct sideload sharing) or `.aab` (for Play Store upload) — either works, an `.apk` is simpler if you just want to hand the file to someone directly rather than publish it.
6. **To get the full app-like experience (no browser address bar at all)**: PWABuilder's Android package page also shows you a SHA-256 signing fingerprint. This package already includes a template at `.well-known/assetlinks.json` **at the true site root** (not inside `app/` — this is required by the Digital Asset Links standard regardless of where the app itself lives) — open it, fill in your real `package_name` and that fingerprint, and make sure it ends up hosted at your domain's true root (e.g. `https://yourname.github.io/growingseeds/.well-known/assetlinks.json`) alongside everything else from Step 1. Without this step the generated app still works, it'll just show a thin browser toolbar at the top instead of running fully full-screen.
7. Upload the `.aab` to the [Google Play Console](https://play.google.com/console) (one-time $25 developer registration fee) to publish it, or just share the `.apk` file directly for sideloading if you don't need the Play Store.

**iOS (.ipa) — genuinely requires Apple's own toolchain, no way around it:**
Apple only allows iOS apps to be built and signed using Xcode, which only runs on macOS, and only accepts App Store submissions via a paid Apple Developer account ($99/year). PWABuilder can still generate the wrapped Xcode *project* for you from the same hosted URL, but someone still needs a Mac with Xcode to open that project, build it, and submit it — this isn't a limitation specific to this sandbox, it's an Apple platform requirement that applies no matter who builds it or where.

Given that, the realistic options for iOS are: (a) stick with the PWA install via Safari (Step 3 above) — genuinely full-screen, icon-on-home-screen, and free, just not distributed through the App Store; or (b) hand the PWABuilder-generated Xcode project to a developer with a Mac (or a Mac-in-the-cloud rental service) to complete the build and submission. I'm happy to walk through generating that Xcode project package with you if you want to pursue (b).
