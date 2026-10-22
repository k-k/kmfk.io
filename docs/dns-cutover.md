# Moving kmfk.io from the Droplet to App Platform

The app spec (`.do/app.yaml`) attaches `kmfk.io` and `www.kmfk.io` to the app, but App Platform can't serve them until DNS points at it. Until then the old Droplet keeps serving traffic, so nothing changes for visitors before the switch.

## How it's set up today (checked 2026-10-22)

| Record | Value | Notes |
| --- | --- | --- |
| NS | `ns1/ns2/ns3.digitalocean.com` | DigitalOcean DNS (registrar: Name.com) |
| `@` A | the old Droplet (nginx 1.4.6 / Ubuntu 14.04, still serving the PHP site, Let's Encrypt cert) | TTL 300 |
| `www` CNAME | `kmfk.io.` | follows the apex |
| `static` CNAME | `kmfk-static.sfo2.cdn.digitaloceanspaces.com.` | Spaces CDN. Not responding, and the new site doesn't use it |
| MX | `aspmx.l.google.com` (1), `alt1`/`alt2.aspmx.l.google.com` (5), `aspmx2`/`aspmx3.googlemail.com` (10) | Google Workspace email |
| `@` TXT | `v=spf1 include:_spf.google.com ~all`, `keybase-site-verification=…` | |
| CAA, AAAA, DMARC | none | No CAA, so certificate issuance isn't restricted |

The kmfk.io zone and the Droplet are **not** in the DigitalOcean account that holds the current doctl login. They live in a second DigitalOcean account or team.

## Why the account matters

DigitalOcean DNS can't hold a CNAME at the apex, so App Platform can only point `kmfk.io` at an app when it manages the zone itself. That requires **the app and the domain to be in the same DigitalOcean account/team**. A domain can only exist in one DigitalOcean account at a time.

Pick one:

- **Option 1: Move the zone into the current account (recommended).** Everything ends up in one place, and the old account can be closed once the Droplet is gone.
- **Option 2: Create the app in the old account.** This is the fewest steps, since no DNS records move, but it keeps the old account around.

## Option 1: move the zone, then cut over

1. **Before the move:** merge the PR, then create the app in the current account (`doctl apps create --spec .do/app.yaml`). Check it at its `https://<app>.ondigitalocean.app` URL: `/`, `/blobs/show/qpush-bundle`, and an image.
2. In the **old** account, export the zone (`doctl compute domain records list kmfk.io -o json > kmfk.io-records.json`, using a doctl context for that account) or screenshot Networking → Domains → kmfk.io. Look for records the public lookup couldn't see (e.g. a DKIM `google._domainkey` TXT or other subdomains).
3. In the old account, delete the `kmfk.io` domain. **From this moment until step 4 finishes, kmfk.io doesn't resolve**, so do steps 3–4 back to back. Mail servers retry for hours, so a gap of a few minutes doesn't lose email.
4. In the current account, add `kmfk.io` under Networking → Domains and immediately recreate:
   - the 5 MX records above, with their priorities
   - the SPF and keybase TXT records
   - any other records from the export, except `@` A and `www` CNAME (App Platform creates those in the next step)
   - optionally `static` CNAME, though it can be dropped since nothing uses it
5. In the app's Settings → Domains, confirm both domains with "DigitalOcean manages my domain". App Platform points `kmfk.io` and `www` at the app and issues the certificate, which usually takes a few minutes.

## Option 2: app in the old account

1. Merge the PR and create the app **in the old account**, then check it on its `ondigitalocean.app` URL.
2. In Settings → Domains, confirm `kmfk.io` and `www.kmfk.io` with "DigitalOcean manages my domain". App Platform replaces the `@` A record and the `www` CNAME. MX, TXT and `static` are untouched.

## Verify

```sh
dig +short A kmfk.io @ns1.digitalocean.com   # no longer the old Droplet IP
dig +short MX kmfk.io @ns1.digitalocean.com  # the Google MX records are still there
curl -sI https://kmfk.io/ | head -1           # 200, without an nginx/1.4.6 Server header
curl -sI https://www.kmfk.io/ | head -1
```

Send a test email to an @kmfk.io address too.

## Retire the Droplet

Keep the Droplet for a few days in case you need to roll back. Rolling back means pointing `@` A at its IP again. Then snapshot it if you want a backup, and destroy it. The `kmfk-static` Space can go too once you've confirmed nothing else uses it. Optionally add a DMARC record (`_dmarc` TXT `v=DMARC1; p=none; rua=mailto:…`), since there isn't one today.
