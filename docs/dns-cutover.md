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

The kmfk.io zone and the Droplet belong to the **`kmfk.io` team** in DigitalOcean. A doctl token is scoped to a single team, so a token from another team won't see them.

## Create the app in the `kmfk.io` team

DigitalOcean DNS can't hold a CNAME at the apex, so App Platform can only point `kmfk.io` at an app when it manages the zone itself. That requires **the app and the domain to be in the same team**. Create the app in the `kmfk.io` team. No DNS records have to move.

1. In the control panel, switch to the `kmfk.io` team. For the CLI, create an API token in that team and add a context: `doctl auth init --context kmfk-io`, then `doctl auth switch --context kmfk-io`.
2. Merge the PR and create the app: `doctl apps create --spec .do/app.yaml` (or Create App in the control panel). Check it at its `https://<app>.ondigitalocean.app` URL: `/`, `/blobs/show/qpush-bundle`, and an image.
3. Optionally export the zone first as a backup: `doctl compute domain records list kmfk.io -o json > kmfk.io-records.json`.
4. In the app's Settings → Domains, confirm `kmfk.io` and `www.kmfk.io` with "DigitalOcean manages my domain". App Platform replaces the `@` A record and the `www` CNAME, then issues the certificate, which usually takes a few minutes. MX, TXT and `static` are left alone, so email isn't affected.

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
