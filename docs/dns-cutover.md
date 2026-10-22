# Moving kmfk.io from the Droplet to App Platform

The app spec (`.do/app.yaml`) attaches `kmfk.io` to the app, but App Platform can't serve the domain until DNS points at it. Until then, the existing Droplet keeps serving traffic. Nothing changes for visitors until you change DNS.

## 1. Check where DNS is hosted today

```sh
dig +short NS kmfk.io
dig +short A kmfk.io
dig +short CNAME www.kmfk.io
dig +short A static.kmfk.io
dig +short MX kmfk.io
dig +short TXT kmfk.io
dig +short CAA kmfk.io
```

- Nameservers `ns1/ns2/ns3.digitalocean.com`: DNS is in DigitalOcean's Networking → Domains. Follow **path A**.
- Anything else (registrar, Cloudflare, Route 53…): follow **path B**.

**Email:** `keith@kmfk.io` and the rotating aliases rely on the MX and TXT (SPF/DKIM/DMARC) records. Neither path touches them, but don't delete them, and copy them over first if you ever move nameservers.

## 2. Before the switch

1. Merge the PR and create the app (`doctl apps create --spec .do/app.yaml`, or Create App in the control panel).
2. Open the app's default URL (`https://<app>.ondigitalocean.app`) and check `/`, `/blobs/show/qpush-bundle` and an image.
3. A day ahead, lower the TTL on the `kmfk.io` A record (and `www` if it exists) to 300 seconds, so the switch and any rollback take effect quickly.
4. If a CAA record exists, make sure it allows the certificate authority App Platform uses (`letsencrypt.org`). Otherwise the HTTPS certificate can't be issued.

## 3. The switch

### Path A: DNS is already on DigitalOcean

App Platform manages the record itself. In the app's Settings → Domains, `kmfk.io` will show as pending. Confirm "DigitalOcean manages my domain", and the platform replaces the Droplet's A record and issues the certificate. Usually this takes minutes.

### Path B: DNS is with another provider

1. In the app's Settings → Domains, find the CNAME target (`<app>.ondigitalocean.app`).
2. `kmfk.io` is an apex domain, and a plain CNAME isn't allowed at the apex. Use the provider's ALIAS/ANAME/"CNAME flattening" record pointing to that target, and remove the old A record(s) to the Droplet IP.
3. If the provider has no ALIAS-style record, move the nameservers to DigitalOcean instead: add the domain under Networking → Domains, recreate **every** existing record there first (MX, TXT, etc.), then change nameservers at the registrar and continue with path A.

## 4. Other hostnames

- `www.kmfk.io`: if it exists today, add it to the app as an alias domain (`type: ALIAS` in `.do/app.yaml`) and point it the same way, or it keeps going to the Droplet.
- `static.kmfk.io`: the new site doesn't use it. Leave it on the Droplet until you retire the Droplet, then delete the record.

## 5. Verify, then retire the Droplet

```sh
dig +short A kmfk.io                 # no longer the Droplet's IP
curl -sI https://kmfk.io/ | head -1  # HTTP/2 200 from App Platform
```

Keep the Droplet running for a few days (at least the old TTL) in case you need to roll back. Rolling back just means pointing the record back to the Droplet IP. Then snapshot it if you want a backup, destroy it, and raise the TTL back up.
