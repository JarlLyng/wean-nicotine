# Scripts

Local maintainer tooling. Not part of the app or website build.

## `asc_downloads.py` — App Store Connect downloads/sales

Pulls download/sales numbers for Wean Nicotine (and any other apps on the same
vendor account) straight from the App Store Connect API, from the command line.

### Nothing here is a secret-in-the-repo

This is a **public** repo, so no credentials are ever committed. The script reads
everything from environment variables at runtime, and the actual secret — the
`.p8` private key — stays on your machine. Both `*.p8` and `.env` are gitignored;
only `.env.example` (no real values) is tracked. Verify any time with:

```bash
git check-ignore -v AuthKey_XXXXXX.p8 .env .venv/
```

### One-time setup

1. **Create an App Store Connect API key** with access to sales reports:
   App Store Connect → _Users and Access_ → _Integrations_ → _App Store Connect API_
   → generate a key with the **Sales and Reports** role (Finance/Admin also work).
   Download the `AuthKey_XXXXXX.p8` file — Apple only lets you download it once.
   Note the **Key ID** and the **Issuer ID** shown on that page.
2. **Find your Vendor Number:** App Store Connect → _Payments and Financial Reports_
   (top-left, near your account name).
3. **Configure credentials locally:**
   ```bash
   cp .env.example .env        # .env is gitignored
   ```
   Fill in `ASC_KEY_ID`, `ASC_ISSUER_ID`, and `ASC_VENDOR_NUMBER` in `.env`.
   For the private key, either drop the single `AuthKey_XXXXXX.p8` in the repo
   root (auto-detected, and gitignored), or set `ASC_PRIVATE_KEY=/path/to/AuthKey_XXXXXX.p8`.
4. **Install the one dependency** in a gitignored virtualenv:
   ```bash
   python3 -m venv .venv
   .venv/bin/pip install "pyjwt[crypto]"
   ```

### Usage

```bash
.venv/bin/python scripts/asc_downloads.py --help
.venv/bin/python scripts/asc_downloads.py                 # last 7 days
.venv/bin/python scripts/asc_downloads.py --days 30
.venv/bin/python scripts/asc_downloads.py --date 2026-06-01
.venv/bin/python scripts/asc_downloads.py --all-time      # 12 monthly + this month's daily
.venv/bin/python scripts/asc_downloads.py --all-time --app 6758867485   # Wean Nicotine only
```

The Apple ID for `--app` is in App Store Connect → your app → _App Information_
("Apple ID"). Wean Nicotine is `6758867485`. Without `--app`, the report covers
the whole vendor account (every app).

### Things to know about the data

- The sales report covers the **whole vendor account** (all apps). Use `--app` to
  isolate one app.
- **Product type codes:** for iOS, `1`/`1F`/`1T` are new downloads and `7`/`7F`/`7T`
  are updates; for Mac, `F1` is a download and `F7` an update. "Downloaded" means the
  new-download codes, not the updates.
- Reports lag **~24–48h**, so the most recent day(s) show `(no report)` — that's normal.
- Apple retains **monthly** reports for 12 months and **daily** reports for 365 days.
