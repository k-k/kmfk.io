# Moving kmfk.io from the Droplet to App Platform

The app spec (`.do/app.yaml`) attaches `kmfk.io` and `www.kmfk.io` to the app, but App Platform can't serve them until DNS points at it. Until then the old Droplet keeps serving traffic, so nothing changes for visitors before the switch.

## How it's set up today (checked 2026-10-22)

Everything lives in the **`kmfk.io` team** (project "Keith Kirk"). A doctl token is scoped to one team, so use a context for this team: `doctl auth init --context kmfk`.

Traffic: `kmfk.io` / `www` → load balancer `kmfk-sfo1-load-balancer-01` (terminates HTTPS with a DO-managed Let's Encrypt cert) → Droplet `kmfk.io` (sfo1, 512 MB, Ubuntu 14.04, nginx + PHP on port 80).

| Record | Value | Notes |
| --- | --- | --- |
| NS | `ns1/ns2/ns3.digitalocean.com` | DO DNS in the `kmfk.io` team; registrar Name.com |
| `@` A | load balancer IP | TTL 300, so the switch is quick |
| `www` CNAME | `@` | follows the apex |
| `static` CNAME | `kmfk-static.sfo2.cdn.digitaloceanspaces.com.` | Spaces CDN with no custom domain cert, so it's broken. The new site doesn't use it |
| MX | `aspmx.l.google.com` (1), `alt1`/`alt2.aspmx.l.google.com` (5), `aspmx2`/`aspmx3.googlemail.com` (10) | Google Workspace email |
| `@` TXT | `v=spf1 include:_spf.google.com ~all`, `keybase-site-verification=…` | |
| `gvvvxav7ptid` CNAME | `….dv.googlehosted.com` | Google domain verification |
| `mx._domainkey.fundraising` TXT | DKIM key | old sender for fundraising.kmfk.io |
| CAA, AAAA, DMARC | none | |

The same team also has **`spokesman.io`**, whose A record points straight at the same Droplet. Retiring the Droplet takes that site down too.

## Create the app in the `kmfk.io` team

DigitalOcean DNS can't hold a CNAME at the apex, so App Platform can only point `kmfk.io` at an app when it manages the zone itself. That requires **the app and the domain to be in the same team**. Create the app in the `kmfk.io` team. No DNS records have to move.

1. In the control panel, switch to the `kmfk.io` team. For the CLI, create an API token in that team and add a context: `doctl auth init --context kmfk`, then pass `--context kmfk` to each command.
2. Merge the PR and create the app: `doctl apps create --spec .do/app.yaml --context kmfk` (or Create App in the control panel). Check it at its `https://<app>.ondigitalocean.app` URL: `/`, `/blobs/show/qpush-bundle`, and an image.
3. Optionally export the zone first as a backup: `doctl compute domain records list kmfk.io -o json --context kmfk > kmfk.io-records.json`.
4. In the app's Settings → Domains, confirm `kmfk.io` and `www.kmfk.io` with "DigitalOcean manages my domain". App Platform replaces the `@` A record and the `www` CNAME, then issues the certificate, which usually takes a few minutes. MX, TXT and `static` are left alone, so email isn't affected.

## Verify

```sh
dig +short A kmfk.io @ns1.digitalocean.com   # no longer the load balancer IP
dig +short MX kmfk.io @ns1.digitalocean.com  # the Google MX records are still there
curl -sI https://kmfk.io/ | head -1           # 200, without an nginx/1.4.6 Server header
curl -sI https://www.kmfk.io/ | head -1
```

Send a test email to an @kmfk.io address too.

## Retire the old setup

Keep everything running for a few days in case you need to roll back. Rolling back means pointing `@` A at the load balancer IP again. Then, in the `kmfk.io` team:

1. Decide what happens to `spokesman.io` (move it, redirect it, or let it go). It still runs on the Droplet.
2. Delete the `static` CNAME, and the `kmfk-static` Space once you've confirmed nothing else uses it.
3. Delete the load balancer and its certificate, then snapshot the Droplet if you want a backup, and destroy it along with its "Default" firewall.

Optional: add a DMARC record (`_dmarc` TXT `v=DMARC1; p=none; rua=mailto:…`) and Google DKIM from the Workspace admin console. Neither exists today.
